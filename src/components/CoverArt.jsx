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
      {/* Aspiration's logo: an outlined sprout on a green disc (still) */}
      <circle cx="50" cy="53" r="35" className="ca-asp-disc" />
      <path d="M38 73.5 H63" className="ca-asp-stroke" />
      <path d="M51.5 73 C51.5 66 49 61 51.5 54 C52.5 51.5 53 51 53 50" className="ca-asp-stroke" />
      <path d="M51.5 54 C45 45 37 42 31 43.5 C33.5 50.5 41 56 51.5 54 Z" className="ca-asp-stroke" />
      <path d="M53 50 C54 41 60 35.5 69 33.5 C68.5 42.5 62 48.5 53 50 Z" className="ca-asp-stroke" />
    </>
  )
}

/* Gizmo's own app icon (the original image, unaltered), centred on
   the cover as a rounded tile. Still. */
function Gizmo() {
  return (
    <>
      <rect x="20" y="21.5" width="60" height="60" rx="13.5" className="ca-giz-shadow" />
      <image href="/work/gizmo/logo.webp" x="20" y="20" width="60" height="60" />
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
      </g>
      <circle cx="50" cy="50" r="1.6" className="ca-hole" />
      {/* The sheen stays put while the record turns under it */}
      <path d="M50 14 A36 36 0 0 1 81 32 L50 50 Z" className="ca-sheen" />
    </>
  )
}

function Pricing() {
  const people = [22, 33.2, 44.4, 55.6, 66.8, 78]
  // Heights in proportion to price, the tallest kept clear of the crowd line.
  const bars = [
    { x: 21, top: 62, price: '$12' },
    { x: 42, top: 56, price: '$15' },
    { x: 63, top: 46, price: '$20' },
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
