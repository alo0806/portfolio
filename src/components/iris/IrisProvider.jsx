import { useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useReducedMotion from '../../hooks/useReducedMotion'
import { readNumberToken } from '../../lib/tokens'
import { IrisContext } from './irisContext'
import './Iris.css'

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

/* Two frames, so the new route has painted — but never longer than
   `ms`: a backgrounded tab stops producing frames entirely. */
const nextPaint = (ms = 120) =>
  Promise.race([
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    }),
    wait(ms),
  ])

/* An animation's end, or its duration plus a margin, whichever comes
   first. Animations pause with the tab; navigation shouldn't. */
const settle = (animation, ms) =>
  Promise.race([animation.finished.catch(() => {}), wait(ms + 400)])

/* A full-screen overlay that lives above the routes, so it survives the
   route change it is covering.

   cover({ to, origin }) — the iris: a circle of paper grows from `origin`
   (a point in the viewport) to the farthest corner, the route changes
   underneath while the screen is fully covered, then the overlay fades
   away and the new page runs its own entrance.

   Without an origin, or with reduced motion, the same sequence runs as a
   quick opacity fade. */

export default function IrisProvider({ children }) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const overlayRef = useRef(null)
  const busyRef = useRef(false)

  const run = useCallback(
    async (el, { to, state, origin, color = '--paper', onCovered }) => {
      const irisMs = readNumberToken('--iris-ms', 850)
      const fadeMs = readNumberToken('--fade-ms', 220)

      try {
        el.getAnimations().forEach((animation) => animation.cancel())
        el.style.background = `var(${color})`
        el.dataset.active = 'true'

        if (origin && !reduced) {
          const { x, y } = origin
          const radius =
            Math.hypot(
              Math.max(x, window.innerWidth - x),
              Math.max(y, window.innerHeight - y),
            ) + 2
          el.style.clipPath = `circle(0px at ${x}px ${y}px)`
          await settle(
            el.animate(
              [
                { clipPath: `circle(0px at ${x}px ${y}px)` },
                { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
              ],
              {
                duration: irisMs,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'forwards',
              },
            ),
            irisMs,
          )
        } else {
          el.style.clipPath = 'none'
          await settle(
            el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: fadeMs,
              easing: 'ease-out',
              fill: 'forwards',
            }),
            fadeMs,
          )
        }

        // Fully covered: swap the route underneath, synchronously, so the
        // new page exists before the overlay starts to lift.
        onCovered?.()
        await navigate(to, { state, flushSync: true })
        await nextPaint()

        const liftMs = reduced ? fadeMs : 360
        await settle(
          el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: liftMs,
            easing: 'ease-out',
            fill: 'forwards',
          }),
          liftMs,
        )
      } finally {
        el.getAnimations().forEach((animation) => animation.cancel())
        el.dataset.active = 'false'
        el.style.clipPath = ''
        busyRef.current = false
      }
    },
    [navigate, reduced],
  )

  /* Returns whether the transition started. One runs at a time; a call
     made mid-transition is refused, and the caller must not act as if it
     were leaving (see IntroPage). */
  const cover = useCallback(
    (options) => {
      const el = overlayRef.current
      if (!el || busyRef.current) return false
      busyRef.current = true
      run(el, options)
      return true
    },
    [run],
  )

  const value = useMemo(() => ({ cover }), [cover])

  return (
    <IrisContext.Provider value={value}>
      {children}
      <div className="iris" ref={overlayRef} data-active="false" aria-hidden="true" />
    </IrisContext.Provider>
  )
}
