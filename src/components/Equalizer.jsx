import './Equalizer.css'

/* Three bars that bounce on the beat while playing and rest when paused. */
export default function Equalizer({ className = '' }) {
  return (
    <span className={`equalizer ${className}`.trim()} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}
