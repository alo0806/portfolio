import { readToken } from '../../lib/tokens'

/* The drawing, as data. Each stroke is kept in coordinates relative to
   the canvas centre and divided by the canvas radius (half its shorter
   side), so any canvas — the full overlay, the card's preview, the PNG
   export — can redraw it at any size. Width is stored the same way.

   stroke = { color: token name, width, n: copies, mirror, points: [[x, y]] }

   Lives in this module (not a component), so the drawing survives
   closing the overlay and switching pages, until the tab is reloaded. */

export const COLORS = [
  { token: '--accent', label: 'Orange' },
  { token: '--on-indigo', label: 'Off-white' },
  { token: '--cover-plum-b', label: 'Lavender' },
  { token: '--cover-mint-a', label: 'Teal' },
]

export const SIZES = [
  { id: 'small', px: 3, label: 'Small brush' },
  { id: 'medium', px: 7, label: 'Medium brush' },
  { id: 'large', px: 14, label: 'Large brush' },
]

export const SYMMETRY = { min: 2, max: 24, initial: 12 }

const state = {
  strokes: [],
  history: [], // what undo reverses: { type: 'stroke' } or { type: 'clear', strokes }
  settings: { color: COLORS[0].token, size: 'medium', n: SYMMETRY.initial, mirror: false },
}
let snapshot = { strokes: state.strokes, settings: state.settings, canUndo: false }
const listeners = new Set()

function emit() {
  snapshot = { strokes: state.strokes, settings: state.settings, canUndo: state.history.length > 0 }
  listeners.forEach((listener) => listener())
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return snapshot
}

export function setSettings(patch) {
  state.settings = { ...state.settings, ...patch }
  emit()
}

export function addStroke(stroke) {
  state.strokes = [...state.strokes, stroke]
  state.history = [...state.history, { type: 'stroke' }]
  emit()
}

export function clear() {
  if (!state.strokes.length) return
  state.history = [...state.history, { type: 'clear', strokes: state.strokes }]
  state.strokes = []
  emit()
}

// Undo reverses the last stroke — or brings back everything a clear removed.
export function undo() {
  const last = state.history.at(-1)
  if (!last) return
  state.history = state.history.slice(0, -1)
  state.strokes = last.type === 'clear' ? last.strokes : state.strokes.slice(0, -1)
  emit()
}

/* ─── Rendering ─────────────────────────────────────────────────── */

export function resolveColor(token) {
  return readToken(token) || '#ffffff'
}

/* Sizes a canvas for its CSS box at the screen's pixel density (so lines
   stay sharp) and returns the drawing frame: centre and radius in CSS px. */
export function fitCanvas(canvas, radiusFor = (w, h) => Math.min(w, h) / 2) {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const width = Math.max(1, Math.round(rect.width * dpr))
  const height = Math.max(1, Math.round(rect.height * dpr))
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx, cx: rect.width / 2, cy: rect.height / 2, r: radiusFor(rect.width, rect.height), w: rect.width, h: rect.height }
}

/* Runs `draw` once per copy: n rotations, each also mirrored if asked. */
function eachCopy(ctx, frame, stroke, draw) {
  const step = (Math.PI * 2) / stroke.n
  for (let k = 0; k < stroke.n; k += 1) {
    for (const flip of stroke.mirror ? [1, -1] : [1]) {
      ctx.save()
      ctx.translate(frame.cx, frame.cy)
      ctx.rotate(step * k)
      ctx.scale(frame.r, frame.r * flip)
      draw()
      ctx.restore()
    }
  }
}

function prepare(ctx, stroke, color) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = stroke.width // already in radius units; the copy is scaled by r
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

/* A smooth path: quadratic curves through each point, ending at the
   midpoints between them (so there are no corners between samples). */
function tracePath(ctx, points, upTo = points.length) {
  const pts = points.slice(0, upTo)
  if (pts.length === 1) {
    ctx.beginPath()
    ctx.arc(pts[0][0], pts[0][1], ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length - 1; i += 1) {
    const [x, y] = pts[i]
    const [nx, ny] = pts[i + 1]
    ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2)
  }
  const [lx, ly] = pts[pts.length - 1]
  ctx.lineTo(lx, ly)
  ctx.stroke()
}

export function drawStroke(ctx, frame, stroke, colors, upTo) {
  const color = colors[stroke.color] ?? resolveColor(stroke.color)
  eachCopy(ctx, frame, stroke, () => {
    prepare(ctx, stroke, color)
    tracePath(ctx, stroke.points, upTo)
  })
}

/* Only the newest piece of a stroke in progress — cheap enough to run on
   every pointer move, even with 24 mirrored copies. */
export function drawStrokeTail(ctx, frame, stroke, color) {
  const pts = stroke.points
  const i = pts.length - 1
  if (i < 1) {
    drawStroke(ctx, frame, stroke, { [stroke.color]: color })
    return
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const start = i === 1 ? pts[0] : mid(pts[i - 2], pts[i - 1])
  const end = mid(pts[i - 1], pts[i])
  eachCopy(ctx, frame, stroke, () => {
    prepare(ctx, stroke, color)
    ctx.beginPath()
    ctx.moveTo(start[0], start[1])
    ctx.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], end[0], end[1])
    ctx.stroke()
  })
}

export function colorMap() {
  return Object.fromEntries(COLORS.map(({ token }) => [token, resolveColor(token)]))
}

export function drawAll(ctx, frame, strokes) {
  ctx.clearRect(0, 0, frame.w, frame.h)
  const colors = colorMap()
  strokes.forEach((stroke) => drawStroke(ctx, frame, stroke, colors))
}

/* The drawing as a PNG, on the card's dark background. */
export function exportPng(strokes, width, height) {
  const canvas = document.createElement('canvas')
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = resolveColor('--panel-dark')
  ctx.fillRect(0, 0, width, height)
  const frame = { cx: width / 2, cy: height / 2, r: Math.min(width, height) / 2, w: width, h: height }
  const colors = colorMap()
  strokes.forEach((stroke) => drawStroke(ctx, frame, stroke, colors))
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
