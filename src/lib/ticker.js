/* One shared animation-frame loop for every per-frame visual on the site
   (cursor, mascot eyes, records, canvases), instead of one
   requestAnimationFrame loop each.

   onFrame(fn) adds a subscriber; fn(now, dt) runs once per frame, with dt
   in seconds (capped at 0.1 so a backgrounded tab doesn't jump). Return
   false from fn to unsubscribe — e.g. once something has settled — and
   call onFrame again when there's work to do. The loop itself only runs
   while it has subscribers, and the browser pauses it in hidden tabs. */

const subscribers = new Set()
let frame = 0
let last = 0

function loop(now) {
  const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1)
  last = now
  for (const fn of [...subscribers]) {
    if (fn(now, dt) === false) subscribers.delete(fn)
  }
  frame = subscribers.size ? requestAnimationFrame(loop) : 0
}

export function onFrame(fn) {
  subscribers.add(fn)
  if (!frame) {
    last = performance.now()
    frame = requestAnimationFrame(loop)
  }
  return () => subscribers.delete(fn)
}

/* Lower canvas resolution than the screen's: at most 1.5×, and 1.25× on
   phone-sized screens, so big or dense screens don't multiply the work. */
export function canvasPixelRatio() {
  const cap = window.matchMedia('(max-width: 899px)').matches ? 1.25 : 1.5
  return Math.min(window.devicePixelRatio || 1, cap)
}
