/* The cassette buddy's skeleton and poses — plain numbers, no DOM.

   Coordinates are the SVG's own units: the viewBox is 100 × 80, the
   ground (where the feet stand, and where the player bar's top edge will
   be) is y = GROUND. The body is drawn around its own centre, so a pose
   just says where that centre is (cx, cy), how far it leans (rot, in
   degrees, pivoting on the bottom edge) and how wide it is (sx — the
   tape flip squeezes it to 0 and back).

   A pose is one flat object of numbers so poses can be blended:
   - cx, cy, rot, sx — the body
   - flx, fly, frx, fry — the feet, in world units: planted unless a pose
     moves them
   - hlx, hly, hrx, hry — the hands, relative to the body centre
   - lx, ly — where the reels look, -1…1 across the window
   - reel (size), spin (turns per second), lid (0 open … 1 closed),
     happy (reels become ^ ^), zz (asleep) and snore (0–1, the sleeping
     breath the z's rise and fade with). It has no mouth: the reels and
     the body do all the expressing. */

export const VIEW_W = 100
export const VIEW_H = 80
export const GROUND = 77
export const BODY = { w: 56, h: 35, r: 5.5 }
export const PIVOT_Y = BODY.h / 2 // lean pivots on the bottom edge
export const REST = { cx: 50, cy: GROUND - BODY.h / 2 - 29.5 } // feet ~1 limb-bend below the hips
export const FOOT = { rx: 4.2, ry: 2.2, out: 1.4 }
export const FOOT_Y = GROUND - FOOT.ry
export const HAND_R = 2.3

export const JOINTS = {
  shoulderL: [-BODY.w / 2, 3],
  shoulderR: [BODY.w / 2, 3],
  hipL: [-17, BODY.h / 2],
  hipR: [17, BODY.h / 2],
}
export const ARM = [9, 9.5]
export const LEG = [15, 15]

export const REELS = [
  [-9, -0.4],
  [9, -0.4],
]
export const REEL_R = 4.2
export const LOOK = [2, 0.85] // how far the reels travel inside the window

const TAU = Math.PI * 2
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const smooth = (v) => {
  const x = clamp(v)
  return x * x * (3 - 2 * x)
}

/* ─── Geometry ─────────────────────────────────────────────────── */

// A point on the body (its own coordinates) → the SVG's coordinates.
export function toWorld(pose, [x, y]) {
  const a = (pose.rot * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const qx = x * pose.sx
  const qy = y - PIVOT_Y
  return [pose.cx + qx * c - qy * s, pose.cy + PIVOT_Y + qx * s + qy * c]
}

/* A rubber-hose limb from `from` to `to`: two segments solved as a
   simple two-joint chain (so it bends at the elbow or knee as the ends
   come closer, and goes straight — stretching a touch — when they're
   pulled apart), then drawn as one smooth curve through that joint. The
   joint bows away from the body (`centerX`), the way cartoon limbs do. */
export function limb(from, to, [l1, l2], centerX) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const d = Math.hypot(dx, dy) || 0.001
  let jx
  let jy
  if (d >= l1 + l2) {
    const k = l1 / (l1 + l2)
    jx = from[0] + dx * k
    jy = from[1] + dy * k
  } else {
    const bend = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1))
    const heading = Math.atan2(dy, dx)
    const ax = from[0] + l1 * Math.cos(heading + bend)
    const ay = from[1] + l1 * Math.sin(heading + bend)
    const bx = from[0] + l1 * Math.cos(heading - bend)
    const by = from[1] + l1 * Math.sin(heading - bend)
    const outward = Math.sign(from[0] - centerX) || 1
    const pickA = (ax - centerX) * outward >= (bx - centerX) * outward
    jx = pickA ? ax : bx
    jy = pickA ? ay : by
  }
  // A quadratic curve passes through its control point's midpoint pull:
  // aim it so the curve goes through the joint.
  const qx = 2 * jx - (from[0] + to[0]) / 2
  const qy = 2 * jy - (from[1] + to[1]) / 2
  const f = (n) => n.toFixed(2)
  return `M${f(from[0])} ${f(from[1])}Q${f(qx)} ${f(qy)} ${f(to[0])} ${f(to[1])}`
}

/* ─── Poses ────────────────────────────────────────────────────── */

export const KEYS = [
  'cx', 'cy', 'rot', 'sx',
  'flx', 'fly', 'frx', 'fry',
  'hlx', 'hly', 'hrx', 'hry',
  'lx', 'ly', 'reel', 'spin', 'lid', 'happy', 'zz', 'snore',
]

export function restPose() {
  return {
    cx: REST.cx,
    cy: REST.cy,
    rot: 0,
    sx: 1,
    flx: REST.cx + JOINTS.hipL[0] - 0.5,
    fly: FOOT_Y,
    frx: REST.cx + JOINTS.hipR[0] + 0.5,
    fry: FOOT_Y,
    hlx: -34,
    hly: 17,
    hrx: 34,
    hry: 17,
    lx: 0,
    ly: 0,
    reel: 1,
    spin: 0,
    lid: 0,
    happy: 0,
    zz: 0,
    snore: 0,
  }
}

export function lerpPose(a, b, t) {
  if (t <= 0) return a
  const out = {}
  for (const key of KEYS) out[key] = a[key] + (b[key] - a[key]) * t
  return out
}

/* idle: breathing (the body rises, the knees straighten), now and then a
   slow shift of weight from one foot to the other. `e` (energy, 0–1)
   scales every motion, so it can come to rest smoothly. */
export function idlePose(t, e) {
  const p = restPose()
  const breath = 0.5 + 0.5 * Math.sin((t * TAU) / 3.4)
  // Two slow waves multiplied: long still stretches, an occasional lean.
  const shift = Math.sin(t * 0.55) * Math.max(0, Math.sin(t * 0.21 + 1))
  p.cy -= breath * 1.6 * e
  p.cx += shift * 1.8 * e
  p.rot += shift * 1.4 * e
  p.hly += (1 - breath) * 0.7 * e
  p.hry += (1 - breath) * 0.7 * e
  return p
}

/* vibing: three small dances, each held for 8 bars (32 beats), cross-
   faded over a beat at the change. `b` is the running beat count. */
const MOVES = [bounceMove, twoStepMove, shoulderMove]

export function vibePose(b, e) {
  const bar8 = Math.floor(b / 32)
  const into = b - bar8 * 32
  const now = MOVES[((bar8 % 3) + 3) % 3](b)
  const pose = into < 1 ? lerpPose(MOVES[(((bar8 - 1) % 3) + 3) % 3](b), now, smooth(into)) : now
  const out = lerpPose(restPose(), pose, e)
  out.spin = 0.55 * e
  return out
}

// Knees bounce on the beat, the head nods, one foot taps, arms swing loose.
function bounceMove(b) {
  const p = restPose()
  const f = b - Math.floor(b)
  const down = 0.5 + 0.5 * Math.cos(TAU * b) // 1 on the beat
  const sway = Math.sin(Math.PI * b) // one way, then back, over two beats
  p.cy += 2.6 * down - 0.6
  p.rot = 2.6 * (down - 0.5) + 0.8 * sway
  p.cx += 0.8 * sway
  p.fry = FOOT_Y - 3 * Math.sin(Math.PI * f) ** 2 // heel down on the beat
  p.hlx += 2.4 * sway
  p.hrx += 2.4 * sway
  p.hly += 1.6 * down
  p.hry += 1.6 * down
  return p
}

// A side-to-side two-step: each foot only moves while it's lifted.
const STEP_L = [0, -3.2, -3.2, -3.2, 0]
const STEP_R = [0, 0, -3.2, 0, 0]
function twoStepMove(b) {
  const p = restPose()
  const beatIn = ((Math.floor(b) % 4) + 4) % 4
  const f = b - Math.floor(b)
  const k = smooth(f)
  const left = STEP_L[beatIn] + (STEP_L[beatIn + 1] - STEP_L[beatIn]) * k
  const right = STEP_R[beatIn] + (STEP_R[beatIn + 1] - STEP_R[beatIn]) * k
  const lift = Math.sin(Math.PI * f) * 2.6
  const down = 0.5 + 0.5 * Math.cos(TAU * b)
  p.flx += left
  p.frx += right
  if (STEP_L[beatIn] !== STEP_L[beatIn + 1]) p.fly -= lift
  if (STEP_R[beatIn] !== STEP_R[beatIn + 1]) p.fry -= lift
  p.cx += (left + right) / 2
  p.cy += 1.8 * down - 0.4
  p.rot = (right - left) * 0.9
  const swing = Math.sin(Math.PI * b)
  p.hly += 2 * swing
  p.hry -= 2 * swing
  p.hlx += (left + right) / 2
  p.hrx += (left + right) / 2
  return p
}

// Shoulders bounce on every half beat, fists up by the body.
function shoulderMove(b) {
  const p = restPose()
  const half = 0.5 + 0.5 * Math.cos(2 * TAU * b)
  p.cy += 1.3 * half - 0.3
  p.rot = 1.6 * Math.sin(Math.PI * b)
  p.hlx = -31
  p.hly = 4 + 2 * half
  p.hrx = 31
  p.hry = 4 + 2 * (1 - half)
  return p
}

/* sitting on the edge (the ground line), legs dangling over it and
   swaying a little, hands on the ledge, reels still — the seated idle,
   and paused. `sleep` (0–1) droops the lids (0.5 is sleepy), quiets the
   sway and, near 1, it's asleep.

   Drowsy (around 0.5), it nods off every few seconds: it sinks, the
   hands slide off the ledge and the lids fall shut, then it catches
   itself with a little jerk. Asleep, it breathes slow and deep, slumped
   to one side, and the z's rise and fade with each breath (snore). */
export const SIT_CY = GROUND - BODY.h / 2
const NOD_S = 7
export function pausedPose(t, sleep, e) {
  const p = restPose()
  const sway = (1 - sleep * 0.8) * e
  const asleep = smooth((sleep - 0.8) / 0.2)
  p.cy = SIT_CY - 0.5 * (0.5 + 0.5 * Math.sin((t * TAU) / (4 + sleep * 2))) * e
  p.flx = REST.cx + JOINTS.hipL[0] - 1 + Math.sin(t * 1.7) * 2.2 * sway
  p.frx = REST.cx + JOINTS.hipR[0] + 1 + Math.sin(t * 1.7 + 2.4) * 2.2 * sway
  p.fly = GROUND + 29 // hanging nearly straight
  p.fry = GROUND + 29
  p.hlx = -32
  p.hly = 15.5
  p.hrx = 32
  p.hry = 15.5
  p.lid = smooth(sleep / 0.9)
  p.zz = asleep

  // Nodding off: only while drowsy, not awake or fully asleep.
  const drowsy = smooth((sleep - 0.25) / 0.2) * (1 - asleep)
  if (drowsy > 0 && e > 0) {
    const phase = (t % NOD_S) / NOD_S
    // Sinks slowly from 55% to 88% of the cycle, then catches itself.
    const nod = (phase < 0.88 ? smooth((phase - 0.55) / 0.33) : 1 - smooth((phase - 0.88) / 0.05)) * drowsy * e
    p.cy += 1.4 * nod
    p.rot += 1.2 * nod
    p.hly += 1.8 * nod
    p.hry += 1.8 * nod
    p.lid += (1 - p.lid) * nod
  }

  // Asleep: a slow, deep breath, slumped a little to one side.
  if (asleep > 0) {
    const breath = 0.5 + 0.5 * Math.sin((t * TAU) / 4.6)
    p.cy += (0.6 - 1.1 * breath) * asleep * e
    p.rot += -2.2 * asleep
    p.hly += 1.2 * asleep
    p.hry += 1.2 * asleep
    p.snore = breath * asleep * e
  }
  return p
}

/* seated vibing: the music's chill, so no dancing — sitting on the edge,
   it sways gently from side to side over two beats, bobs a touch on
   each beat, swings its legs in turn and taps one hand on the ledge.
   The reels turn like a playing tape. `b` is the running beat count. */
export function seatedVibePose(t, b, e) {
  const p = pausedPose(t, 0, 0) // the seat, without the idle leg sway
  const f = b - Math.floor(b)
  const down = 0.5 + 0.5 * Math.cos(TAU * b) // 1 on the beat
  const sway = Math.sin(Math.PI * b) // one way, then back, over two beats
  p.rot = 1.8 * sway * e
  p.cy += 0.7 * down * e
  // Legs swing in turn, each lifting a little at the front of its swing.
  p.flx += 2.4 * sway * e
  p.frx -= 2.4 * sway * e
  p.fly -= 2.2 * Math.max(0, sway) * e
  p.fry -= 2.2 * Math.max(0, -sway) * e
  // The right hand taps the ledge: up between beats, down on the beat.
  p.hry -= 2.4 * Math.sin(Math.PI * f) ** 2 * e
  p.spin = 0.55 * e
  return p
}

/* ─── Actions: layered over whatever the base state is doing ───── */

// hover: an arm waves — the one on the cursor's side (side -1 is its
// left arm, 1 its right).
export function waveAction(p, t, side = -1) {
  const q = { ...p }
  const x = side * (31 + 3.2 * Math.sin(t * TAU * 2.2))
  const y = -19 + 1.2 * Math.cos(t * TAU * 4.4)
  if (side < 0) {
    q.hlx = x
    q.hly = y
  } else {
    q.hrx = x
    q.hry = y
  }
  return q
}

// hover while drowsy: no wave — the hand on the cursor's side comes up
// and slowly scratches the top of its head, the body tips toward it and
// the reels droop further, as if half woken. (The hands are drawn behind
// the cassette, so the top edge is where a hand can still be seen.)
export function scratchAction(p, t, side = -1) {
  const q = { ...p }
  const x = side * (13 + 1.4 * Math.sin(t * TAU * 1.3))
  const y = -21 + 0.7 * Math.cos(t * TAU * 2.6)
  if (side < 0) {
    q.hlx = x
    q.hly = y
  } else {
    q.hrx = x
    q.hry = y
  }
  q.rot = p.rot + side * 1.6
  q.lid = Math.max(p.lid, 0.72)
  return q
}

// talking: one arm holds the speech bubble up, and the body gives a
// little bob with each babbled word (`talking` 0–1 follows the words).
export function holdAction(p, t, talking) {
  const q = { ...p }
  q.hrx = 22 + 0.6 * Math.sin(t * TAU * 0.8)
  q.hry = -27 + 0.6 * Math.cos(t * TAU * 0.8)
  q.cy -= 0.9 * talking
  q.reel = p.reel * (1 + 0.05 * talking)
  return q
}

// click: a startled jump, arms flung out, then back down (k: 0 → 1).
export function jumpAction(p, k) {
  const q = { ...p }
  const up = Math.sin(Math.PI * k)
  q.cy -= 11 * up
  q.fly -= 8.5 * up
  q.fry -= 8.5 * up
  q.flx -= 2 * up
  q.frx += 2 * up
  q.hlx = -40
  q.hly = -12
  q.hrx = 40
  q.hry = -12
  q.reel = 1.22
  q.lid = 0
  return q
}

/* click while drowsy: a big yawn and stretch instead of a jump — both
   arms reach up overhead, the body rises with them and the reels squeeze
   shut, held for a moment, then it all sinks back (k: 0 → 1). */
export function yawnAction(p, k) {
  const q = { ...p }
  const up = smooth(k / 0.35) * (1 - smooth((k - 0.7) / 0.3))
  q.hlx = p.hlx + (-15 - p.hlx) * up
  q.hly = p.hly + (-31 - p.hly) * up
  q.hrx = p.hrx + (15 - p.hrx) * up
  q.hry = p.hry + (-31 - p.hry) * up
  q.cy -= 2.6 * up
  q.reel = p.reel * (1 + 0.06 * up)
  q.lid = p.lid + (1 - p.lid) * up
  return q
}

/* click while asleep: it stirs without waking — a small jolt, a wobble,
   one hand flops up and down, and the lids crack open for a moment
   before falling shut again (k: 0 → 1). */
export function stirAction(p, k) {
  const q = { ...p }
  const jolt = Math.sin(Math.PI * clamp(k / 0.25))
  const peek = Math.sin(Math.PI * clamp((k - 0.15) / 0.55))
  q.cy -= 1.6 * jolt
  q.rot = p.rot + 2.4 * Math.sin(k * TAU * 2) * (1 - k)
  q.hly = p.hly - 7 * peek
  q.lid = p.lid - 0.45 * peek
  return q
}

/* songChange: hop, turn over like a tape going from side A to side B
   (the body narrows to nothing and opens again — the label's arrow
   flips at the middle), land, and settle into the knees (k: 0 → 1). */
export function flipAction(p, k) {
  const q = { ...p }
  const hop = clamp(k / 0.8)
  const up = Math.sin(Math.PI * hop)
  const turn = clamp((k - 0.1) / 0.6)
  q.cy -= 16 * up
  q.sx = p.sx * Math.abs(Math.cos(Math.PI * turn))
  q.fly -= 10 * up
  q.fry -= 10 * up
  q.flx += 5 * up
  q.frx -= 5 * up
  q.hlx = p.hlx + (-30 - p.hlx) * up
  q.hly = p.hly + (-16 - p.hly) * up
  q.hrx = p.hrx + (30 - p.hrx) * up
  q.hry = p.hry + (-16 - p.hry) * up
  q.lid = 0
  // Landing: down into the knees and back up.
  if (k > 0.8) q.cy += 2.8 * Math.sin(Math.PI * clamp((k - 0.8) / 0.2))
  return q
}

/* ─── Expressions, over any state ─── */

export const EXPRESSIONS = {
  happy: (p) => ({ ...p, happy: 1 }),
  surprised: (p) => ({ ...p, reel: 1.22, lid: 0, happy: 0 }),
  sleepy: (p) => ({ ...p, lid: Math.max(p.lid, 0.55), happy: 0 }),
}
