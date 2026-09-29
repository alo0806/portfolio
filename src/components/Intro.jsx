import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { readToken } from '../lib/tokens'
import './Intro.css'

/* Gray paper → thin lines draw themselves → "Austin" → ink drops fall and
   pool into the blob → the hero is revealed. About 2.7 seconds, once per
   session, skippable, and never shown with reduced motion.

   The lines are drawn exactly where the hero's own line art sits, and the
   drops pool exactly where the blob lives, so when the paper lifts the
   drawing simply carries on underneath. */

const STORAGE_KEY = 'astnlo:intro-seen'
const REVEAL_AT = 2050
const DONE_AT = 2700
const SKIP_FADE = 450

function shouldPlay() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return false
  }
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true // storage unavailable: playing once more is harmless
  }
}

function lineMarkup({ vw, vh, hx, hy, stage }) {
  const unit = stage / 300 // the hero line art's own coordinate scale
  const ring = 128 * unit
  const inner = 92 * unit
  const horizon = hy + 64 * unit
  const moonX = hx + 82 * unit
  const moonY = hy - 88 * unit
  const cx = vw / 2

  const shapes = [
    `<circle cx="${hx}" cy="${hy}" r="${ring}" />`,
    `<circle cx="${hx}" cy="${hy}" r="${inner}" />`,
    `<path d="M${hx} ${horizon} L${vw} ${horizon}" />`,
    `<path d="M${hx} ${horizon} L0 ${horizon}" />`,
    `<path d="M${cx} 0 L${cx} ${vh * 0.16}" />`,
    `<path d="M${cx} ${vh} L${cx} ${vh * 0.84}" />`,
    `<circle cx="${moonX}" cy="${moonY}" r="${9 * unit}" />`,
  ]

  return shapes
    .map((shape, i) =>
      shape.replace(' />', ` pathLength="1" style="--i:${i}" />`),
    )
    .join('')
}

export default function Intro() {
  const [playing, setPlaying] = useState(shouldPlay)
  const [leaving, setLeaving] = useState(false)
  const rootRef = useRef(null)
  const linesRef = useRef(null)
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  const skip = useCallback(() => {
    clearTimers()
    setLeaving(true)
    timersRef.current.push(
      window.setTimeout(() => setPlaying(false), SKIP_FADE),
    )
  }, [])

  /* Measure the hero before the first paint so the drawing lands exactly
     on top of the real line art and the drops land on the blob's home. */
  useLayoutEffect(() => {
    if (!playing) return
    const root = rootRef.current
    const lines = linesRef.current
    const home = document.querySelector('#hero [data-blob-home]')
    const stageEl = document.querySelector('#hero .stage')
    if (!root || !lines || !home || !stageEl) return

    const homeRect = home.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const hx = homeRect.left
    const hy = homeRect.top
    const stage = stageEl.getBoundingClientRect().width
    const r = readToken('--blob-r', 34)

    root.style.setProperty('--hx', `${hx}px`)
    root.style.setProperty('--hy', `${hy}px`)
    root.style.setProperty('--r', `${r}px`)
    // Wide screens: centre the name in the open space left of the ring
    // rather than letting the hairlines cut through the letters.
    const open = hx - (128 * stage) / 300
    root.style.setProperty('--nx', `${open > 600 ? open / 2 : vw / 2}px`)
    lines.innerHTML = lineMarkup({ vw, vh, hx, hy, stage })
  }, [playing])

  useEffect(() => {
    if (!playing) return undefined

    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Not persisted; the intro may play again next load.
    }

    timersRef.current.push(
      window.setTimeout(() => setLeaving(true), REVEAL_AT),
      window.setTimeout(() => setPlaying(false), DONE_AT),
    )

    const onKey = (event) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      clearTimers()
      window.removeEventListener('keydown', onKey)
    }
  }, [playing, skip])

  if (!playing) return null

  return (
    <div
      className="intro"
      ref={rootRef}
      data-leaving={leaving ? 'true' : 'false'}
    >
      <button type="button" className="ui-label intro__skip" onClick={skip}>
        Skip intro
      </button>

      <svg className="intro__lines" ref={linesRef} aria-hidden="true" />

      <p className="intro__name" aria-hidden="true">
        Austin
      </p>

      <div className="intro__ink" aria-hidden="true">
        <span className="intro__pool" />
        <span className="intro__drop" style={{ '--d': 0.62, '--dx': '-10px', '--delay': '1180ms' }} />
        <span className="intro__drop" style={{ '--d': 0.74, '--dx': '8px', '--delay': '1360ms' }} />
        <span className="intro__drop" style={{ '--d': 0.9, '--dx': '0px', '--delay': '1540ms' }} />
      </div>

      <svg className="intro__filters" aria-hidden="true" focusable="false">
        <filter id="intro-goo" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
          />
        </filter>
      </svg>
    </div>
  )
}
