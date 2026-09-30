import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useReducedMotion from '../../hooks/useReducedMotion'
import { cancelAnimations, ease } from '../../lib/motion'
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
const settle = (finished, ms) =>
  Promise.race([Promise.resolve(finished).catch(() => {}), wait(ms + 400)])

const GROOVES = 3

/* Everything that must survive the route change it covers lives here,
   above the routes.

   cover({ to, origin, delay })
     The iris. A circle of paper grows from `origin` to the farthest
     corner, led by a thin orange ring with faint groove rings rippling
     behind it. Under full cover the route changes (tagged
     entrance: 'iris' so the layout choreographs its arrival), then the
     overlay steps aside. `delay` holds the transition while the caller
     plays a lead-in (tonearm, crackle, spin-up). Without an origin, or
     with reduced motion, it's a quick fade instead.

   reverse({ to, target })
     The iris played backward, via View Transitions: the current page is
     snapshotted and contracts into a circle onto `target` (a selector on
     the incoming page — the record). Falls back to a fade.

   Both return whether they started; one transition runs at a time.
   Browser back/forward mid-transition aborts it cleanly. */

export default function IrisProvider({ children }) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const paperRef = useRef(null)
  const ringsRef = useRef(null)
  const busyRef = useRef(false)
  const runRef = useRef({ aborted: false })
  const viewTransitionRef = useRef(null)

  const rings = () => Array.from(ringsRef.current?.children ?? [])

  const reset = useCallback(() => {
    const paper = paperRef.current
    cancelAnimations(paper)
    rings().forEach(cancelAnimations)
    if (paper) {
      paper.dataset.active = 'false'
      paper.style.clipPath = ''
    }
    ringsRef.current?.setAttribute('data-active', 'false')
  }, [])

  /* Rings share the paper's clock and curve, scaled from the origin, so
     the orange one rides exactly on the circle's edge. */
  const playRings = useCallback((x, y, radius, duration, direction) => {
    const svg = ringsRef.current
    if (!svg) return
    svg.setAttribute('data-active', 'true')
    const reverse = direction === 'in'
    rings().forEach((circle, i) => {
      circle.setAttribute('cx', x)
      circle.setAttribute('cy', y)
      circle.setAttribute('r', radius)
      circle.style.transformOrigin = `${x}px ${y}px`
      const lead = i === 0
      const frames = lead
        ? [
            { transform: 'scale(0)', opacity: 1 },
            { opacity: 1, offset: 0.82 },
            { transform: 'scale(1)', opacity: 0 },
          ]
        : [
            { transform: 'scale(0)', opacity: 0 },
            { opacity: 0.35 - i * 0.07, offset: 0.3 },
            { transform: 'scale(0.9)', opacity: 0 },
          ]
      circle.animate(frames, {
        duration,
        delay: lead ? 0 : i * 70,
        easing: ease('in-out'),
        direction: reverse ? 'reverse' : 'normal',
        fill: 'both',
      })
    })
  }, [])

  const runCover = useCallback(
    async (run, { to, state, origin, color = '--paper', delay = 0, onCovered }) => {
      const paper = paperRef.current
      const irisMs = readNumberToken('--iris-ms', 850)
      const fadeMs = readNumberToken('--fade-ms', 220)
      const iris = Boolean(origin) && !reduced

      try {
        // Hold the transition through the caller's lead-in so it can't be
        // started twice.
        if (delay > 0) await wait(delay)
        if (run.aborted) return

        cancelAnimations(paper)
        paper.style.background = `var(${color})`
        paper.dataset.active = 'true'

        if (iris) {
          const { x, y } = origin
          const radius =
            Math.hypot(
              Math.max(x, window.innerWidth - x),
              Math.max(y, window.innerHeight - y),
            ) + 2
          paper.style.clipPath = `circle(0px at ${x}px ${y}px)`
          playRings(x, y, radius, irisMs, 'out')
          await settle(
            paper.animate(
              [
                { clipPath: `circle(0px at ${x}px ${y}px)` },
                { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
              ],
              { duration: irisMs, easing: ease('in-out'), fill: 'forwards' },
            ).finished,
            irisMs,
          )
        } else {
          paper.style.clipPath = 'none'
          await settle(
            paper.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: fadeMs,
              easing: 'ease-out',
              fill: 'forwards',
            }).finished,
            fadeMs,
          )
        }
        if (run.aborted) return

        // Fully covered: swap the route underneath, synchronously.
        onCovered?.()
        await navigate(to, {
          state: { ...state, entrance: iris ? 'iris' : 'fade' },
          flushSync: true,
        })
        await nextPaint()
        if (run.aborted) return

        // After an iris the new page arrives on bare paper (its sidebar,
        // player and content all start off-stage), so the overlay can step
        // aside almost at once and the arrival reads as one motion.
        const liftMs = iris ? 140 : fadeMs
        await settle(
          paper.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: liftMs,
            easing: 'ease-out',
            fill: 'forwards',
          }).finished,
          liftMs,
        )
      } finally {
        if (runRef.current === run) {
          reset()
          busyRef.current = false
        }
      }
    },
    [navigate, playRings, reduced, reset],
  )

  const runReverse = useCallback(
    async (run, { to, state, target }) => {
      const html = document.documentElement
      const irisMs = readNumberToken('--iris-ms', 850)
      html.dataset.vt = 'reverse'

      try {
        const transition = document.startViewTransition(() =>
          navigate(to, { state: { ...state, entrance: 'return' }, flushSync: true }),
        )
        viewTransitionRef.current = transition
        await transition.ready
        if (run.aborted) return

        // The incoming page is in place underneath: aim at its record.
        const rect = document.querySelector(target)?.getBoundingClientRect()
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
        const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
        const radius =
          Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
          ) + 2

        html.animate(
          {
            clipPath: [
              `circle(${radius}px at ${x}px ${y}px)`,
              `circle(0px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: irisMs,
            easing: ease('in-out'),
            pseudoElement: '::view-transition-old(root)',
            fill: 'forwards',
          },
        )
        playRings(x, y, radius, irisMs, 'in')
        await settle(transition.finished, irisMs)
      } catch {
        // Skipped or interrupted: nothing is left half-drawn, the
        // navigation itself has already happened.
      } finally {
        if (runRef.current === run) {
          delete html.dataset.vt
          viewTransitionRef.current = null
          reset()
          busyRef.current = false
        }
      }
    },
    [navigate, playRings, reset],
  )

  const begin = useCallback(() => {
    if (busyRef.current || !paperRef.current) return null
    busyRef.current = true
    const run = { aborted: false }
    runRef.current = run
    return run
  }, [])

  const cover = useCallback(
    (options) => {
      const run = begin()
      if (!run) return false
      runCover(run, options)
      return true
    },
    [begin, runCover],
  )

  const reverse = useCallback(
    (options) => {
      if (reduced || typeof document.startViewTransition !== 'function') {
        return cover({ to: options.to, state: options.state, color: '--indigo' })
      }
      const run = begin()
      if (!run) return false
      runReverse(run, options)
      return true
    },
    [begin, cover, reduced, runReverse],
  )

  // Back/forward mid-transition: the router is already moving; drop
  // whatever we were doing and leave nothing on screen.
  useEffect(() => {
    const onPopState = () => {
      if (!busyRef.current) return
      runRef.current.aborted = true
      viewTransitionRef.current?.skipTransition?.()
      viewTransitionRef.current = null
      delete document.documentElement.dataset.vt
      reset()
      busyRef.current = false
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [reset])

  const value = useMemo(() => ({ cover, reverse }), [cover, reverse])

  return (
    <IrisContext.Provider value={value}>
      {children}
      <div className="iris" ref={paperRef} data-active="false" aria-hidden="true" />
      <svg className="iris__rings" ref={ringsRef} data-active="false" aria-hidden="true" focusable="false">
        {Array.from({ length: GROOVES + 1 }, (_, i) => (
          <circle key={i} className={i === 0 ? 'iris__ring iris__ring--lead' : 'iris__ring'} />
        ))}
      </svg>
    </IrisContext.Provider>
  )
}
