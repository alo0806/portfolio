import { useEffect, useRef } from 'react'
import { watchInView } from '../lib/coverMotion'
import './CoverArt.css'

/* Minimal animated covers for the Singles: one small vector scene each,
   drawn on a 100×100 grid over the cover's palette gradient, so they're
   crisp at any size. All motion is CSS keyframes on transform and
   opacity (CoverArt.css); this component only reports whether it's on
   screen. `mode`: 'hover' on a card (plays while the card is hovered or
   focused, or simply while on screen on touch screens), 'view' in a case
   study's header (plays while on screen). Every scene's resting frame
   is a complete picture, for reduced motion and while paused. */

function Aspiration() {
  return (
    <>
      {/* The jar, and the change already inside it */}
      <clipPath id="ca-jar-inside">
        <rect x="31.5" y="55.5" width="37" height="29" rx="6" />
      </clipPath>
      <g clipPath="url(#ca-jar-inside)">
        <rect className="ca-anim ca-asp-level" x="30" y="58" width="40" height="28" />
      </g>
      <rect x="30" y="54" width="40" height="32" rx="7" className="ca-line ca-glass" />
      <rect x="36" y="48" width="28" height="7" rx="2" className="ca-line ca-glass" />
      {/* The sprout growing out of it: an old leaf, and a new one */}
      <path d="M42 48 C42 42 42 36 42 30" className="ca-line" />
      <path d="M42 38 C35 38 30 33 29 27 C36 27 41 31 42 38 Z" className="ca-fill" />
      <path className="ca-anim ca-asp-leaf ca-fill" d="M42 31 C49 31 54 26 55 20 C48 20 43 24 42 31 Z" />
      {/* The round-up, dropping in */}
      <g className="ca-anim ca-asp-coin">
        <circle cx="59" cy="14" r="5.5" className="ca-coin" />
        <text x="59" y="16.6" className="ca-coin-text">¢</text>
      </g>
    </>
  )
}

function Gizmo() {
  const reel = (x, cls) => (
    <g className={`ca-anim ${cls}`}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit, i) => (
        <text key={i} x={x} y={87.2 + i * 10} className="ca-digit">
          {digit}
        </text>
      ))}
    </g>
  )
  return (
    <>
      {/* A second card behind, for a deck */}
      <rect x="27" y="31" width="48" height="34" rx="4" transform="rotate(-7 51 48)" className="ca-card-back" />
      {/* The flashcard: question, then answer */}
      <g className="ca-anim ca-giz-front">
        <rect x="26" y="30" width="48" height="34" rx="4" className="ca-card" />
        <text x="50" y="53" className="ca-card-text">Q</text>
      </g>
      <g className="ca-anim ca-giz-back">
        <rect x="26" y="30" width="48" height="34" rx="4" className="ca-card" />
        <text x="50" y="53" className="ca-card-text">A</text>
      </g>
      {/* A view counter, ticking up */}
      <rect x="9" y="78" width="36" height="13" rx="6.5" className="ca-pill" />
      <path d="M14.5 81.6 L19.5 84.5 L14.5 87.4 Z" className="ca-fill" />
      <clipPath id="ca-reels">
        <rect x="21" y="79" width="20" height="11" />
      </clipPath>
      <g clipPath="url(#ca-reels)">
        <text x="24.5" y="87.2" className="ca-digit">
          4
        </text>
        {reel(29.5, 'ca-giz-tens')}
        {reel(34.5, 'ca-giz-ones')}
      </g>
      <text x="39" y="87.2" className="ca-digit">
        K
      </text>
      {/* Gizmo's own logo, as a small badge, unaltered */}
      <image href="/work/gizmo/logo-badge.webp" x="77" y="8" width="15" height="15" />
    </>
  )
}

function Record() {
  return (
    <>
      <circle cx="50" cy="52" r="37" className="ca-shadow" />
      <g className="ca-anim ca-rec-spin">
        <circle cx="50" cy="50" r="36" className="ca-vinyl" />
        {[33, 30, 27, 24, 21, 18].map((r) => (
          <circle key={r} cx="50" cy="50" r={r} className="ca-groove" />
        ))}
        <circle cx="50" cy="50" r="12" className="ca-label" />
        <text x="50" y="52.6" className="ca-label-text">
          AL
        </text>
      </g>
      <circle cx="50" cy="50" r="1.6" className="ca-hole" />
      {/* The sheen stays put while the record turns under it */}
      <path d="M50 14 A36 36 0 0 1 81 32 L50 50 Z" className="ca-sheen" />
    </>
  )
}

function Pricing() {
  const people = [22, 33.2, 44.4, 55.6, 66.8, 78]
  const bars = [
    { x: 21, top: 58.4, price: '$12' },
    { x: 42, top: 51.5, price: '$15' },
    { x: 63, top: 40, price: '$20' },
  ]
  return (
    <>
      {/* The crowd: the same six people at every price */}
      {people.map((x) => (
        <g key={x} className="ca-fill">
          <circle cx={x} cy="17" r="3" />
          <path d={`M${x - 4.2} 28 C${x - 4.2} 22.5 ${x + 4.2} 22.5 ${x + 4.2} 28 Z`} />
        </g>
      ))}
      <line x1="14" y1="32" x2="86" y2="32" className="ca-level" />
      {/* The price ladder, stepping up */}
      {bars.map(({ x, top, price }, i) => (
        <g key={price}>
          <rect x={x} y={top} width="16" height={86 - top} rx="2" className={`ca-anim ca-bar ca-bar-${i + 1}`} />
          <text x={x + 8} y={top - 3.5} className={`ca-anim ca-price ca-price-${i + 1}`}>
            {price}
          </text>
        </g>
      ))}
      <line x1="14" y1="86.5" x2="86" y2="86.5" className="ca-line" />
    </>
  )
}

const SCENES = { aspiration: Aspiration, gizmo: Gizmo, record: Record, pricing: Pricing }

export default function CoverArt({ kind, mode = 'view' }) {
  const ref = useRef(null)
  useEffect(() => watchInView(ref.current), [])
  const Scene = SCENES[kind]
  return (
    <svg ref={ref} className="cover-art" data-kind={kind} data-mode={mode} viewBox="0 0 100 100" aria-hidden="true">
      {Scene ? <Scene /> : null}
    </svg>
  )
}
