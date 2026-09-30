import './covers.css'
import './CoverMark.css'

/* The site's logo: a tiny album cover with initials and a record peeking
   out of the sleeve. Drawn, not an image. */
export default function CoverMark({ size = 40, className = '' }) {
  return (
    <span
      className={`cover-mark ${className}`.trim()}
      data-palette="sunset"
      style={{ '--mark': `${size}px` }}
      aria-hidden="true"
    >
      <span className="cover-mark__record" />
      <span className="cover-mark__sleeve">AL</span>
    </span>
  )
}
