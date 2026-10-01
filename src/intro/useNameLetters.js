import { useEffect } from 'react'
import { onFrame } from '../lib/ticker'
import { sound } from '../sound/engine'

const REACH = 1.1 // how far the cursor is felt, in font sizes
const LIFT = 0.09 // how high a letter rises, in font sizes
const STIFFNESS = 180 // the spring pulling each letter to where it should be
const DAMPING = 14 // low enough for a small bounce on the way back
const REMEASURE_MS = 300

/* The letters of the name react to the cursor one by one: the nearer the
   pointer, the higher a letter lifts (on a spring, so it bounces a little
   coming back) and the more it takes on the accent colour. Each letter
   also plays its own soft note as the pointer moves onto it, rising
   through the scale from the first letter to the last.

   Letters are any [data-letter] inside the root. Only transform and one
   colour variable (--tint) change; nothing reflows. Letter positions are
   read at most every 300ms, never every frame. Runs on the shared ticker
   only while a letter is moving or the pointer is near. Under reduced
   motion the letters stay still; the notes still play. Touch works the
   same: a finger on the name. */
export default function useNameLetters(rootRef, { reduced = false, enabled = true } = {}) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled) return undefined
    const letters = [...root.querySelectorAll('[data-letter]')]
    if (!letters.length) return undefined

    const state = letters.map(() => ({ lift: 0, speed: 0, x: 0, y: 0, w: 0, h: 0 }))
    let px = -1e5
    let py = -1e5
    let size = 0
    let measuredAt = -Infinity
    let hovered = -1
    let stopTicking = null

    const measure = () => {
      size = Number.parseFloat(getComputedStyle(root).fontSize) || 48
      letters.forEach((el, i) => {
        const rect = el.getBoundingClientRect()
        const s = state[i]
        s.w = rect.width
        s.h = rect.height
        s.x = rect.left + rect.width / 2
        s.y = rect.top + rect.height / 2 + s.lift * LIFT * size // where it rests
      })
      measuredAt = performance.now()
    }

    const near = () =>
      state.some((s) => Math.abs(px - s.x) < size * REACH + s.w && Math.abs(py - s.y) < size * REACH + s.h)

    const tick = (now, frameDt) => {
      const dt = Math.min(frameDt, 1 / 30)
      const reach = size * REACH
      let moving = false
      letters.forEach((el, i) => {
        const s = state[i]
        const closeness = Math.max(0, 1 - Math.hypot(px - s.x, py - s.y) / reach)
        const goal = closeness * closeness * (3 - 2 * closeness)
        s.speed += (STIFFNESS * (goal - s.lift) - DAMPING * s.speed) * dt
        s.lift += s.speed * dt
        if (Math.abs(goal - s.lift) > 0.002 || Math.abs(s.speed) > 0.01) moving = true
        else {
          s.lift = goal
          s.speed = 0
        }
        el.style.transform = s.lift ? `translate3d(0, ${(-s.lift * LIFT * size).toFixed(2)}px, 0)` : ''
        el.style.setProperty('--tint', Math.min(1, Math.max(0, s.lift)).toFixed(3))
      })
      if (!moving && !near()) {
        stopTicking = null
        return false
      }
      return true
    }

    const onPoint = (event) => {
      px = event.clientX
      py = event.clientY
      if (performance.now() - measuredAt > REMEASURE_MS) measure()

      // The note: moving onto a letter (not around inside it).
      const over = state.findIndex(
        (s) => Math.abs(px - s.x) <= s.w / 2 && Math.abs(py - s.y) <= s.h / 2,
      )
      if (over !== hovered) {
        hovered = over
        if (over >= 0) sound.letter(over)
      }

      if (!reduced && !stopTicking && near()) stopTicking = onFrame(tick)
    }

    // A finger lifting, or the pointer leaving the window: let them settle.
    const onAway = (event) => {
      if (event.type === 'pointerup' && event.pointerType === 'mouse') return
      if (event.type === 'pointerout' && event.relatedTarget) return
      px = -1e5
      py = -1e5
      hovered = -1
      if (!reduced && !stopTicking) stopTicking = onFrame(tick)
    }

    const onResize = () => {
      measuredAt = -Infinity
    }

    const options = { passive: true }
    window.addEventListener('pointermove', onPoint, options)
    window.addEventListener('pointerdown', onPoint, options)
    window.addEventListener('pointerup', onAway, options)
    window.addEventListener('pointercancel', onAway, options)
    document.addEventListener('pointerout', onAway, options)
    window.addEventListener('resize', onResize)

    return () => {
      stopTicking?.()
      window.removeEventListener('pointermove', onPoint)
      window.removeEventListener('pointerdown', onPoint)
      window.removeEventListener('pointerup', onAway)
      window.removeEventListener('pointercancel', onAway)
      document.removeEventListener('pointerout', onAway)
      window.removeEventListener('resize', onResize)
      letters.forEach((el) => {
        el.style.transform = ''
        el.style.removeProperty('--tint')
      })
    }
  }, [rootRef, reduced, enabled])
}
