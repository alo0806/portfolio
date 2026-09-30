import { createHash, timingSafeEqual } from 'node:crypto'

/* POST /api/resume  { "password": "…" }  →  the resume PDF, or 401.

   The only server code on the site (a Vercel function). Nothing secret
   is in the repo or the page: both values come from environment
   variables, set in Vercel (Settings → Environment Variables) and, for
   local dev, in .env.local (gitignored):

     RESUME_PASSWORD  the code visitors type
     RESUME_URL       a Google Drive share link to the PDF ("Anyone with
                      the link" — the server fetches it; visitors never
                      see this URL)

   - The password is compared in constant time (both sides hashed, then
     timingSafeEqual), so response timing doesn't leak how close a guess
     was. Wrong answers also wait a moment before replying.
   - Failed attempts are limited per IP. Serverless instances don't share
     memory, so this slows guessing rather than capping it absolutely.
   - Nothing is cached by the browser or any CDN (no-store). */

const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const FAIL_DELAY_MS = 400
const PDF_CACHE_MS = 10 * 60 * 1000

const failures = new Map() // ip → { count, resetAt }
let cachedPdf = null // { buffer, until } — saves re-fetching on a warm instance

function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  if (body === undefined) {
    res.end()
  } else if (Buffer.isBuffer(body)) {
    res.end(body)
  } else {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(body))
  }
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

function sameSecret(given, expected) {
  const a = createHash('sha256').update(String(given)).digest()
  const b = createHash('sha256').update(String(expected)).digest()
  return timingSafeEqual(a, b)
}

async function readPassword(req) {
  // Vercel parses JSON bodies for us; the local dev server doesn't.
  if (req.body && typeof req.body === 'object') return req.body.password
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 2048) return null
  }
  try {
    return JSON.parse(raw || '{}').password
  } catch {
    return null
  }
}

function driveDownloadUrl(shareUrl) {
  const id = /\/d\/([\w-]+)/.exec(shareUrl)?.[1] ?? new URL(shareUrl).searchParams.get('id')
  return id ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}` : null
}

async function loadPdf(shareUrl) {
  if (cachedPdf && cachedPdf.until > Date.now()) return cachedPdf.buffer
  const url = driveDownloadUrl(shareUrl)
  if (!url) return null
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) return null
  const buffer = Buffer.from(await response.arrayBuffer())
  // Drive answers some problems with an HTML page; only a real PDF passes.
  if (buffer.subarray(0, 5).toString('latin1') !== '%PDF-') return null
  cachedPdf = { buffer, until: Date.now() + PDF_CACHE_MS }
  return buffer
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'method' }, { Allow: 'POST' })
  }

  const expected = process.env.RESUME_PASSWORD
  const shareUrl = process.env.RESUME_URL
  if (!expected || !shareUrl) return send(res, 500, { error: 'unconfigured' })

  const ip = clientIp(req)
  const now = Date.now()
  let record = failures.get(ip)
  if (record && record.resetAt <= now) {
    failures.delete(ip)
    record = null
  }
  if (record && record.count >= MAX_FAILURES) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    return send(res, 429, { error: 'too-many' }, { 'Retry-After': String(retryAfter) })
  }

  const password = await readPassword(req)
  if (typeof password !== 'string' || !sameSecret(password, expected)) {
    const next = record ?? { count: 0, resetAt: now + WINDOW_MS }
    next.count += 1
    failures.set(ip, next)
    if (failures.size > 5000) failures.clear() // never grow without bound
    await wait(FAIL_DELAY_MS)
    return send(res, 401, { error: 'wrong', left: Math.max(0, MAX_FAILURES - next.count) })
  }

  failures.delete(ip)
  const pdf = await loadPdf(shareUrl).catch(() => null)
  if (!pdf) return send(res, 502, { error: 'unavailable' })

  return send(res, 200, pdf, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="Austin-Lo-Resume.pdf"',
    'Content-Length': String(pdf.length),
  })
}
