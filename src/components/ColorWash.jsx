import './ColorWash.css'

/* Reads --accent-now and nothing else. It has no idea which section is
   active, which is what keeps the color logic in one place. */

export default function ColorWash() {
  return <div className="color-wash" aria-hidden="true" />
}
