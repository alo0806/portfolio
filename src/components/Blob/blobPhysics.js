/* A damped spring pulling a body toward a target. Damping ratio (zeta)
   below 1 lets it overshoot a touch and ease back — the soft settle.
   Semi-implicit Euler, with dt clamped by the caller, stays stable for
   every stiffness used here. */
export function spring(body, tx, ty, stiffness, zeta, dt) {
  const damping = 2 * zeta * Math.sqrt(stiffness)
  body.vx += (stiffness * (tx - body.x) - damping * body.vx) * dt
  body.vy += (stiffness * (ty - body.y) - damping * body.vy) * dt
  body.x += body.vx * dt
  body.y += body.vy * dt
}

export function snap(body, x, y) {
  body.x = x
  body.y = y
  body.vx = 0
  body.vy = 0
}

/* How hard each mode pulls the head. Following is deliberately loose so
   fast cursor moves leave the blob behind and stretch it out. */
export const HEAD_SPRINGS = {
  follow: { k: 34, zeta: 0.6 },
  free: { k: 40, zeta: 0.66 },
  drag: { k: 260, zeta: 0.82 },
  keyboard: { k: 120, zeta: 0.78 },
}

/* Each trailing circle chases the one ahead of it. Stiffer near the head,
   looser toward the tail, so motion stretches the mass into a teardrop
   and hard moves pull droplets clean off before they catch up. */
export const TRAIL_STIFFNESS = [150, 118, 96, 80, 68]
export const TRAIL_ZETA = 0.62

/* Relative radius of each circle, head first. */
export const RADII = [1, 0.8, 0.72, 0.64, 0.56, 0.5]

/* At rest the trailing circles orbit their leader slightly out of phase,
   so the idle mass is lumpy and slowly breathing, not a disc. */
export function restOffset(index, t, radius) {
  const phase = index * 2.1
  const speed = 0.55 + index * 0.13
  const reach = radius * 0.34
  return {
    x: Math.cos(t * speed + phase) * reach,
    y: Math.sin(t * speed * 1.3 + phase) * reach * 0.8,
  }
}
