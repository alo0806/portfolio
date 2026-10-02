/* Aggregated stats for the Gizmo case study.

   Reads the raw scraped exports in data/gizmo/ (gitignored: they contain
   other people's usernames and comments, so they're never committed or
   shipped), keeps only posts from my time on the team (2024-01-01 to
   2024-10-31), and writes aggregated numbers to src/data/gizmo-stats.json.
   Nothing about any individual commenter or other account is read or
   written.

   Posts I made myself are listed, one URL per line, in
   data/gizmo/my-posts.txt; they're marked and get their own stats. Every
   other number describes the account during my time on the team, not my
   personal results.

   Run: node scripts/gizmo-stats.js */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'data', 'gizmo')
const OUT = join(ROOT, 'src', 'data', 'gizmo-stats.json')
const FROM = Date.parse('2024-01-01T00:00:00Z')
const TO = Date.parse('2024-11-01T00:00:00Z') // exclusive: through Oct 31

/* ─── Reading ─────────────────────────────────────────────────── */

// RFC 4180 CSV: quoted fields may hold commas, quotes and line breaks.
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1) // byte-order mark
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [head, ...body] = rows
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])))
}

const num = (value) => {
  const n = Number(value)
  return value === '' || !Number.isFinite(n) || n < 0 ? null : n
}

const hashtagsOf = (row) =>
  Object.keys(row).filter((k) => /^hashtags\/\d+(\/name)?$/.test(k) && row[k]).length

// URLs compared without query strings or trailing slashes.
const cleanUrl = (url) => (url ?? '').split('?')[0].replace(/\/+$/, '').toLowerCase()

const mine = new Set(
  existsSync(join(DATA, 'my-posts.txt'))
    ? readFileSync(join(DATA, 'my-posts.txt'), 'utf8')
        .split(/\r?\n/)
        .map((line) => cleanUrl(line.trim()))
        .filter(Boolean)
    : [],
)

function tiktokPosts() {
  return parseCSV(readFileSync(join(DATA, 'tiktok.csv'), 'utf8'))
    .filter((r) => r.id && r.createTimeISO && !r.error)
    .map((r) => {
      const url = r.webVideoUrl || r.url
      return {
        platform: 'tiktok',
        url,
        time: Date.parse(r.createTimeISO),
        video: r.isSlideshow !== 'true',
        views: num(r.playCount),
        likes: num(r.diggCount),
        comments: num(r.commentCount),
        shares: num(r.shareCount),
        saves: num(r.collectCount),
        duration: num(r['videoMeta/duration']),
        caption: r.text ?? '',
        hashtags: hashtagsOf(r),
        cover: r['videoMeta/coverUrl'] || r['videoMeta/originalCoverUrl'] || null,
        mine: mine.has(cleanUrl(url)),
      }
    })
}

function instagramPosts() {
  return parseCSV(readFileSync(join(DATA, 'instagram.csv'), 'utf8'))
    .filter((r) => r.id && r.timestamp)
    .map((r) => {
      const video = r.type === 'Video' || Boolean(r.videoUrl)
      // Reels report plays (newer) and/or views (older); prefer plays.
      const views = video ? (num(r.videoPlayCount) || num(r.videoViewCount)) : null
      return {
        platform: 'instagram',
        url: r.url,
        time: Date.parse(r.timestamp),
        video,
        views,
        likes: num(r.likesCount),
        comments: num(r.commentsCount),
        shares: null, // not in Instagram's public data
        saves: null,
        duration: num(r.videoDuration),
        caption: r.caption ?? '',
        hashtags: hashtagsOf(r),
        cover: r.displayUrl || null,
        mine: mine.has(cleanUrl(r.url)),
      }
    })
}

/* ─── Helpers ─────────────────────────────────────────────────── */

const sum = (xs) => xs.reduce((a, b) => a + b, 0)
function median(xs) {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b)
  if (!s.length) return null
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const round = (x, d = 1) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d)
const engagementOf = (p) => (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0)
const rate = (p) => (p.views ? engagementOf(p) / p.views : null)
const monthOf = (t) => new Date(t).toISOString().slice(0, 7)
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Mann–Whitney U, two-sided, normal approximation with tie correction.
function mannWhitney(a, b) {
  const all = [...a.map((v) => [v, 0]), ...b.map((v) => [v, 1])].sort((x, y) => x[0] - y[0])
  const ranks = new Array(all.length)
  let tie = 0
  for (let i = 0; i < all.length; ) {
    let j = i
    while (j + 1 < all.length && all[j + 1][0] === all[i][0]) j += 1
    const r = (i + j) / 2 + 1
    for (let k = i; k <= j; k += 1) ranks[k] = r
    const t = j - i + 1
    tie += t ** 3 - t
    i = j + 1
  }
  const n1 = a.length
  const n2 = b.length
  const r1 = sum(all.map((x, i) => (x[1] === 0 ? ranks[i] : 0)))
  const u = r1 - (n1 * (n1 + 1)) / 2
  const n = n1 + n2
  const sd = Math.sqrt(((n1 * n2) / 12) * (n + 1 - tie / (n * (n - 1))))
  if (!sd) return 1
  const z = Math.abs((u - (n1 * n2) / 2) / sd)
  // Two-sided p from the normal tail (Abramowitz–Stegun erf approximation).
  const t = 1 / (1 + 0.3275911 * (z / Math.SQRT2))
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-(z * z) / 2)
  return 1 - erf
}

/* A comparison between groups of posts by median views. A difference is
   only called "clear" when the two groups being compared each have at
   least MIN_N posts, the medians differ by at least 1.5×, and a rank test
   agrees (p < 0.05) after a Bonferroni correction for every pair that
   could have been compared — picking the best and worst of seven
   weekdays would otherwise find "patterns" by chance. */
const MIN_N = 8
const HALVES = [
  ['Jan–Apr', '2024-01', '2024-04'],
  ['May–Oct', '2024-05', '2024-10'],
]
function compare(posts, groupOf, order) {
  const groups = new Map()
  for (const p of posts) {
    const g = groupOf(p)
    if (g == null || p.views == null) continue
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g).push(p.views)
  }
  const rows = [...groups.entries()]
    .map(([group, views]) => ({ group, n: views.length, medianViews: Math.round(median(views)) }))
    .sort((a, b) => (order ? order.indexOf(a.group) - order.indexOf(b.group) : b.medianViews - a.medianViews))
  const usable = rows.filter((r) => r.n >= MIN_N).sort((a, b) => b.medianViews - a.medianViews)
  let verdict = { clear: false, reason: 'fewer than two groups with enough posts' }
  if (usable.length >= 2) {
    const best = usable[0]
    const worst = usable.at(-1)
    const ratio = best.medianViews / Math.max(1, worst.medianViews)
    const pairs = (usable.length * (usable.length - 1)) / 2
    const p = Math.min(1, mannWhitney(groups.get(best.group), groups.get(worst.group)) * pairs)
    // Does it hold within each part of the year? Posting habits changed
    // over the tenure (e.g. what time of day posts went out), so a
    // difference between groups can really be "early vs late in the year".
    const within = HALVES.map(([label, from, to]) => {
      const inHalf = (g) =>
        posts
          .filter((x) => groupOf(x) === g && x.views != null)
          .filter((x) => {
            const m = monthOf(x.time)
            return m >= from && m <= to
          })
          .map((x) => x.views)
      const a = inHalf(best.group)
      const b = inHalf(worst.group)
      return {
        period: label,
        [best.group]: { n: a.length, medianViews: a.length ? Math.round(median(a)) : null },
        [worst.group]: { n: b.length, medianViews: b.length ? Math.round(median(b)) : null },
        holds: a.length >= 5 && b.length >= 5 ? median(a) > median(b) : null,
      }
    })
    const checked = within.filter((w) => w.holds !== null)
    const consistent = checked.length > 0 && checked.every((w) => w.holds)
    const clear = ratio >= 1.5 && p < 0.05 && consistent
    verdict = {
      clear,
      within,
      best: best.group,
      worst: worst.group,
      ratio: round(ratio, 2),
      p: round(p, 4),
      comparedGroups: usable.length,
      reason: clear
        ? 'clear difference, and it holds within the same part of the year'
        : ratio < 1.5
          ? 'difference too small'
          : p >= 0.05
            ? 'not significant at this sample size'
            : 'does not hold within the same part of the year (confounded by timing)',
    }
  }
  return { rows, verdict }
}

/* ─── Classifying ─────────────────────────────────────────────── */

function firstLine(caption) {
  return (caption.split(/\r?\n/).find((l) => l.trim()) ?? '').trim()
}

// The first line of a caption, as a kind of hook.
function hookOf(caption) {
  const line = firstLine(caption).toLowerCase()
  if (!line) return 'none'
  if (/\b(send|tag|share)\b.*\b(this|someone|friend|bestie|bff|your)\b|\bsend this\b/.test(line)) return 'send this to someone'
  if (/\?/.test(line) || /^(who|what|when|where|why|how|is|are|do|does|did|can|could|would|will|pov:? you|anyone)\b/.test(line)) return 'question to the viewer'
  if (/\b(gizmo|app|flashcards?|quiz(zes)?|download|link in bio|ai|study|revise|revision|notes)\b/.test(line)) return 'product statement'
  return 'other'
}

const lengthBucket = (p) =>
  p.duration == null ? null : p.duration < 15 ? 'under 15 s' : p.duration < 30 ? '15–30 s' : p.duration < 60 ? '30–60 s' : '60 s +'
const hashtagBucket = (p) => (p.hashtags === 0 ? 'none' : p.hashtags <= 3 ? '1–3' : '4+')
const timeBucket = (p) => {
  const h = new Date(p.time).getUTCHours()
  return h < 6 ? '00–06 UTC' : h < 12 ? '06–12 UTC' : h < 18 ? '12–18 UTC' : '18–24 UTC'
}
const dayOf = (p) => DAYS[new Date(p.time).getUTCDay()]

/* ─── Summaries ───────────────────────────────────────────────── */

function summary(posts) {
  const withViews = posts.filter((p) => p.views != null)
  const views = withViews.map((p) => p.views)
  const engaged = withViews.map(engagementOf)
  return {
    posts: posts.length,
    videos: posts.filter((p) => p.video).length,
    postsWithViews: withViews.length,
    totalViews: sum(views),
    medianViews: Math.round(median(views) ?? 0),
    totalLikes: sum(posts.map((p) => p.likes ?? 0)),
    totalComments: sum(posts.map((p) => p.comments ?? 0)),
    totalShares: posts[0]?.platform === 'tiktok' ? sum(posts.map((p) => p.shares ?? 0)) : null,
    totalSaves: posts[0]?.platform === 'tiktok' ? sum(posts.map((p) => p.saves ?? 0)) : null,
    // Engagement rate = (likes + comments + shares) / views, over the posts
    // that report views. Instagram has no shares in its public data, so
    // its rate is likes + comments only — not comparable to TikTok's.
    engagementRate: views.length ? round((sum(engaged) / sum(views)) * 100, 2) : null,
    medianEngagementRate: round((median(withViews.map(rate)) ?? 0) * 100, 2),
  }
}

function monthly(posts) {
  const months = []
  for (let d = new Date(FROM); d.getTime() < TO; d.setUTCMonth(d.getUTCMonth() + 1)) months.push(d.toISOString().slice(0, 7))
  return months.map((month) => {
    const inMonth = posts.filter((p) => monthOf(p.time) === month)
    return {
      month,
      posts: inMonth.length,
      views: sum(inMonth.map((p) => p.views ?? 0)),
      medianViews: inMonth.length ? Math.round(median(inMonth.map((p) => p.views)) ?? 0) : null,
    }
  })
}

const publicPost = (p) => ({
  platform: p.platform,
  url: p.url,
  date: new Date(p.time).toISOString().slice(0, 10),
  views: p.views,
  engagementRate: round((rate(p) ?? 0) * 100, 2),
  durationSeconds: p.duration,
  hook: hookOf(p.caption),
  // The brand's own first caption line, with @handles removed.
  firstLine: firstLine(p.caption).replace(/@[\w.]+/g, '@…').slice(0, 120),
  mine: p.mine,
})

/* Cross-posted videos: the same video on both platforms on the same
   (UTC) day, matched by caption text. */
function words(caption) {
  return new Set(
    caption
      .toLowerCase()
      .replace(/#[\w]+|@[\w.]+|https?:\S+/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2),
  )
}
function similarity(a, b) {
  if (!a.size || !b.size) return 0
  let shared = 0
  for (const w of a) if (b.has(w)) shared += 1
  return shared / Math.min(a.size, b.size)
}
function crossPosted(tiktok, instagram) {
  const pairs = []
  const used = new Set()
  for (const t of tiktok) {
    if (t.views == null) continue
    const day = new Date(t.time).toISOString().slice(0, 10)
    const tw = words(t.caption)
    let best = null
    for (const ig of instagram) {
      if (used.has(ig) || ig.views == null || new Date(ig.time).toISOString().slice(0, 10) !== day) continue
      const s = similarity(tw, words(ig.caption))
      if (s >= 0.6 && (!best || s > best.s)) best = { ig, s }
    }
    if (best) {
      used.add(best.ig)
      pairs.push({ tiktok: t, instagram: best.ig })
    }
  }
  const ratios = pairs.map((p) => p.instagram.views / Math.max(1, p.tiktok.views))
  return {
    matched: pairs.length,
    medianViews: {
      tiktok: Math.round(median(pairs.map((p) => p.tiktok.views))),
      instagram: Math.round(median(pairs.map((p) => p.instagram.views))),
    },
    instagramMoreViews: pairs.filter((p) => p.instagram.views > p.tiktok.views).length,
    medianViewRatioInstagramToTiktok: round(median(ratios), 2),
    medianEngagementRate: {
      tiktok: round(median(pairs.map((p) => rate(p.tiktok))) * 100, 2),
      instagram: round(median(pairs.map((p) => rate(p.instagram))) * 100, 2),
      note: 'Not like for like: TikTok counts likes + comments + shares; Instagram’s public data has likes + comments only.',
    },
  }
}

/* A repeated format: the "don't worry about how I'm studying" videos,
   re-made several times with small changes between Oct 17 and Oct 29
   2024. Found by the first line of the caption ("don't worry…") in that
   run of posts; a one-off "Don't worry!" caption in March isn't part of
   it. Compared with the account's median over the whole tenure and over
   the same month — an observation about what happened, not a rule. */
const FORMAT_MONTH = '2024-10'
const isDontWorry = (p) =>
  monthOf(p.time) === FORMAT_MONTH && /\bdon'?t worry\b/i.test(firstLine(p.caption).replace(/[’‘]/g, "'"))
function repeatedFormat(posts) {
  const withViews = posts.filter((p) => p.views != null)
  const versions = withViews.filter(isDontWorry).sort((a, b) => a.time - b.time)
  if (!versions.length) return null
  const accountMedian = median(withViews.map((p) => p.views))
  const months = new Set(versions.map((p) => monthOf(p.time)))
  const sameMonthsMedian = median(withViews.filter((p) => months.has(monthOf(p.time))).map((p) => p.views))
  const views = versions.map((p) => p.views)
  const withoutTop = [...views].sort((a, b) => b - a).slice(1)
  return {
    versions: versions.map((p) => ({
      date: new Date(p.time).toISOString().slice(0, 10),
      url: p.url,
      views: p.views,
      timesAccountMedian: round(p.views / accountMedian, 1),
      firstLine: firstLine(p.caption).replace(/#\S+/g, '').replace(/@[\w.]+/g, '@…').trim().slice(0, 80),
    })),
    count: versions.length,
    medianViews: Math.round(median(views)),
    medianViewsWithoutTopVersion: withoutTop.length ? Math.round(median(withoutTop)) : null,
    aboveAccountMedian: versions.filter((p) => p.views > accountMedian).length,
    accountMedian: Math.round(accountMedian),
    sameMonthsMedian: Math.round(sameMonthsMedian),
    months: [...months],
  }
}

function analyse(posts) {
  const vids = posts.filter((p) => p.video && p.views != null)
  return {
    byLength: compare(vids, lengthBucket, ['under 15 s', '15–30 s', '30–60 s', '60 s +']),
    byDay: compare(vids, dayOf, DAYS),
    byTime: compare(vids, timeBucket, ['00–06 UTC', '06–12 UTC', '12–18 UTC', '18–24 UTC']),
    byHashtags: compare(vids, hashtagBucket, ['none', '1–3', '4+']),
    byHook: compare(vids, (p) => hookOf(p.caption), ['question to the viewer', 'send this to someone', 'product statement', 'other', 'none']),
  }
}

/* ─── Run ─────────────────────────────────────────────────────── */

const all = { tiktok: tiktokPosts(), instagram: instagramPosts() }
const inWindow = Object.fromEntries(
  Object.entries(all).map(([k, posts]) => [k, posts.filter((p) => p.time >= FROM && p.time < TO)]),
)

const platforms = {}
for (const [k, posts] of Object.entries(inWindow)) {
  const minePosts = posts.filter((p) => p.mine)
  platforms[k] = {
    rowsInExport: all[k].length,
    postsInWindow: posts.length,
    account: summary(posts),
    mine: minePosts.length ? summary(minePosts) : null,
    monthly: monthly(posts),
    // Months with less than half the typical (median) monthly volume.
    quietMonths: (() => {
      const months = monthly(posts)
      const typical = median(months.map((m) => m.posts))
      return months.filter((m) => m.posts < typical / 2).map((m) => `${m.month} (${m.posts} posts)`)
    })(),
    topByViews: [...posts]
      .filter((p) => p.views != null && (mine.size ? p.mine : true))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(publicPost),
    patterns: analyse(posts),
    repeatedFormat: repeatedFormat(posts),
  }
}

// TikTok's public data rounds big counts (e.g. 4,000,000), so its totals
// are approximate at the top end.
const roundedTikTok = inWindow.tiktok.filter((p) => p.views >= 100000 && p.views % 1000 === 0).length

const stats = {
  caveats: [
    `TikTok rounds large view counts in its public data (${roundedTikTok} of its posts over 100k are exact thousands), so its totals are approximate.`,
    'Instagram’s public data has no shares or saves, so its engagement rate is likes + comments only and isn’t comparable to TikTok’s.',
    'Times are in UTC.',
  ],
  generated: new Date().toISOString().slice(0, 10),
  window: { from: '2024-01-01', to: '2024-10-31' },
  myPostsListed: mine.size,
  myPostsFound: Object.values(inWindow).flat().filter((p) => p.mine).length,
  note:
    mine.size > 0
      ? '"mine" = the posts listed in my-posts.txt; "account" = the whole account during my time on the team.'
      : 'No my-posts.txt yet: every number here describes the account during my time on the team, not my personal results.',
  platforms,
  crossPosted: crossPosted(inWindow.tiktok, inWindow.instagram),
}

writeFileSync(OUT, `${JSON.stringify(stats, null, 2)}\n`)
console.log(`Wrote ${OUT}`)
for (const [k, p] of Object.entries(platforms)) {
  console.log(`${k}: ${p.rowsInExport} posts in the export, ${p.postsInWindow} in 2024-01-01..2024-10-31`)
}
