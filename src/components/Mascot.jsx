import { useEffect, useRef, useState } from 'react'
import { mascotLines, nowPlaying } from '../data/content'
import useReducedMotion from '../hooks/useReducedMotion'
import './Mascot.css'

const LINES = mascotLines.map((line) =>
  line.replace('{song}', nowPlaying.song).replace('{artist}', nowPlaying.artist),
)

const PUPIL_REACH = 2.4 // in the SVG's own units
const EYES = [
  { cx: 37, cy: 44 },
  { cx: 59, cy: 44 },
]

/* A soft rounded blob that lives in the player bar. It bobs to the beat
   while playing, its eyes follow the cursor, and it blinks now and then.
   Hover it, click it, or press Enter on it and it says something (lines
   live in content.js). The line is announced politely to screen readers.
   `align` sets which way the speech bubble opens. */
export default function Mascot({ size = 88, align = 'center' }) {
  const reduced = useReducedMotion()
  const [line, setLine] = useState('')
  const svgRef = useRef(null)
  const pupilLeftRef = useRef(null)
  const pupilRightRef = useRef(null)
  const lastLineRef = useRef(-1)
  const hideTimerRef = useRef(0)

  const say = () => {
    let index = Math.floor(Math.random() * LINES.length)
    if (index === lastLineRef.current) index = (index + 1) % LINES.length
    lastLineRef.current = index
    window.clearTimeout(hideTimerRef.current)
    setLine(LINES[index])
  }

  const hideSoon = (delay) => {
    window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setLine(''), delay)
  }

  const onClick = () => {
    say()
    hideSoon(3200)
    const svg = svgRef.current
    if (svg && !reduced) {
      svg.getAnimations().forEach((animation) => {
        if (animation.id === 'squish') animation.cancel()
      })
      const squish = svg.animate(
        [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.08, 0.9)', offset: 0.35 },
          { transform: 'scale(0.97, 1.04)', offset: 0.7 },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 420, easing: 'ease-out' },
      )
      squish.id = 'squish'
    }
  }

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), [])

  /* Eyes follow the cursor. Skipped while the mascot isn't displayed
     (e.g. the desktop sidebar on a phone) and under reduced motion. */
  useEffect(() => {
    const svg = svgRef.current
    const pupils = [pupilLeftRef.current, pupilRightRef.current]
    if (reduced || !svg || pupils.some((p) => !p)) return undefined

    let px = null
    let py = null
    let frame = 0
    const look = EYES.map(() => ({ x: 0, y: 0 }))

    const onMove = (event) => {
      px = event.clientX
      py = event.clientY
    }

    const loop = () => {
      frame = requestAnimationFrame(loop)
      if (px === null || !svg.isConnected || svg.getClientRects().length === 0) return
      const rect = svg.getBoundingClientRect()
      const scale = rect.width / 96
      EYES.forEach((eye, i) => {
        const ex = rect.left + eye.cx * scale
        const ey = rect.top + eye.cy * scale
        const dx = px - ex
        const dy = py - ey
        const distance = Math.hypot(dx, dy) || 1
        const reach = Math.min(distance / 140, 1) * PUPIL_REACH
        look[i].x += ((dx / distance) * reach - look[i].x) * 0.25
        look[i].y += ((dy / distance) * reach - look[i].y) * 0.25
        pupils[i].setAttribute(
          'transform',
          `translate(${look[i].x.toFixed(2)} ${look[i].y.toFixed(2)})`,
        )
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  /* Blink every few seconds. */
  useEffect(() => {
    const svg = svgRef.current
    if (reduced || !svg) return undefined
    let openTimer = 0
    let nextTimer = 0
    const blink = () => {
      svg.dataset.blink = 'true'
      openTimer = window.setTimeout(() => {
        svg.dataset.blink = 'false'
      }, 140)
      nextTimer = window.setTimeout(blink, 2800 + Math.random() * 3600)
    }
    nextTimer = window.setTimeout(blink, 1800)
    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(nextTimer)
    }
  }, [reduced])

  return (
    <div className="mascot" data-align={align} style={{ '--mascot': `${size}px` }}>
      <p className="mascot__bubble" role="status" data-show={line ? 'true' : 'false'}>
        {line}
      </p>
      <button
        type="button"
        className="mascot__button"
        aria-label="Say hi to the blob"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') say()
        }}
        onPointerLeave={() => hideSoon(1400)}
        onClick={onClick}
        onBlur={() => hideSoon(600)}
      >
        <svg
          ref={svgRef}
          className="mascot__svg"
          viewBox="0 0 96 84"
          width="96"
          height="84"
          aria-hidden="true"
          focusable="false"
          data-blink="false"
        >
          <ellipse cx="48" cy="80" rx="30" ry="3" className="mascot__shadow" />
          <path
            className="mascot__body"
            d="M48 8 C72 8 90 26 90 50 C90 68 76 78 48 78 C20 78 6 68 6 50 C6 26 24 8 48 8 Z"
          />
          <ellipse
            cx="31"
            cy="24"
            rx="9"
            ry="5"
            transform="rotate(-28 31 24)"
            className="mascot__shine"
          />
          <ellipse cx="25" cy="57" rx="5" ry="3" className="mascot__cheek" />
          <ellipse cx="71" cy="57" rx="5" ry="3" className="mascot__cheek" />
          <g className="mascot__eyes">
            {EYES.map((eye, i) => (
              <g key={eye.cx}>
                <ellipse cx={eye.cx} cy={eye.cy} rx="7" ry="8.5" className="mascot__white" />
                <g ref={i === 0 ? pupilLeftRef : pupilRightRef}>
                  <circle cx={eye.cx} cy={eye.cy + 0.5} r="3.8" className="mascot__pupil" />
                  <circle cx={eye.cx + 1.4} cy={eye.cy - 1} r="1.1" className="mascot__glint" />
                </g>
              </g>
            ))}
          </g>
        </svg>
      </button>
    </div>
  )
}
