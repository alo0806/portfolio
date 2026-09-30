import './Tonearm.css'

/* A tonearm drawn in the record's own coordinates (0–100 across the
   disc): the pivot sits just off the top-right of the record and the
   needle lands on the outer grooves. Rests swung away; data-state
   'play' swings it on, then the needle drops. */
export default function Tonearm({ state = 'rest' }) {
  return (
    <svg className="tonearm" data-state={state} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g className="tonearm__swing">
        <g className="tonearm__drop">
          <path className="tonearm__arm" d="M96 6 L90 52 Q89 58 85 62" />
          <rect className="tonearm__head" x="80" y="60" width="8" height="11" rx="1.6" transform="rotate(28 84 65)" />
          <circle className="tonearm__needle" cx="82.6" cy="69.2" r="0.9" />
        </g>
      </g>
      <circle className="tonearm__base" cx="96" cy="6" r="5.2" />
      <circle className="tonearm__pivot" cx="96" cy="6" r="2.1" />
    </svg>
  )
}
