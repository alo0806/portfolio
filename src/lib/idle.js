/* "Is anyone using the page right now?" After IDLE_MS with no mouse,
   scroll, key or touch input, <html data-idle="true"> is set, and the
   ambient CSS loops that opt in (the equalizer bars) hold where
   they are, and the mascot comes to rest (onIdleChange). The next input
   clears it and they carry on from the same spot — no jump.

   Why: any always-running animation makes the browser repaint the whole
   page every frame (165 times a second on a fast screen), even when
   nobody is looking. Holding them while idle lets the GPU rest.

   The input listeners only note the time; a single timer checks it, so
   a moving mouse costs one assignment per event. */

const IDLE_MS = 10000
const EVENTS = ['pointermove', 'pointerdown', 'wheel', 'scroll', 'keydown', 'touchstart']

let lastInput = 0
let timer = 0
let started = false
let idleNow = false
const listeners = new Set()

function setIdle(idle) {
  const root = document.documentElement
  if (idle) root.dataset.idle = 'true'
  else delete root.dataset.idle
  if (idle !== idleNow) {
    idleNow = idle
    listeners.forEach((listener) => listener(idle))
  }
}

/* For JS-driven motion (the mascot) that should rest the same way. */
export function isIdle() {
  return idleNow
}

export function onIdleChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function check() {
  const wait = IDLE_MS - (performance.now() - lastInput)
  if (wait <= 0) {
    timer = 0
    setIdle(true)
  } else {
    timer = window.setTimeout(check, wait)
  }
}

function onInput() {
  lastInput = performance.now()
  if (timer) return
  setIdle(false)
  timer = window.setTimeout(check, IDLE_MS)
}

export function watchIdle() {
  if (started) return
  started = true
  const options = { capture: true, passive: true }
  for (const type of EVENTS) window.addEventListener(type, onInput, options)
  onInput()
}
