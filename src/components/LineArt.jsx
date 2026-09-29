import './LineArt.css'

/* Thin geometric framing for each chapter, drawn in a 300×300 space whose
   centre (150, 150) is exactly where the blob lives. Every shape uses
   pathLength="1" so a single dashoffset transition draws it in, and the
   draw is triggered from CSS when the parent section becomes earned. */

const shape = (Tag, props, index, accent = false) => (
  <Tag
    key={index}
    pathLength="1"
    className={`lineart__shape${accent ? ' lineart__shape--accent' : ''}`}
    style={{ '--i': index }}
    {...props}
  />
)

const VARIANTS = {
  hero: [
    shape('circle', { cx: 150, cy: 150, r: 128 }, 0),
    shape('circle', { cx: 150, cy: 150, r: 92 }, 1),
    shape('line', { x1: 4, y1: 214, x2: 296, y2: 214 }, 2),
    shape('line', { x1: 150, y1: 2, x2: 150, y2: 20 }, 3),
    shape('line', { x1: 150, y1: 280, x2: 150, y2: 298 }, 4),
    shape('circle', { cx: 232, cy: 62, r: 9 }, 5, true),
  ],
  projects: [
    shape('path', { d: 'M150 22 L268 226 L32 226 Z' }, 0),
    shape('circle', { cx: 150, cy: 150, r: 58 }, 1),
    shape('line', { x1: 56, y1: 256, x2: 244, y2: 256 }, 2),
    shape('circle', { cx: 150, cy: 22, r: 5 }, 3, true),
  ],
  about: [
    shape('circle', { cx: 150, cy: 150, r: 60 }, 0),
    shape('path', { d: 'M54 150 A96 96 0 0 1 246 150' }, 1),
    shape('path', { d: 'M280 150 A130 130 0 0 1 20 150' }, 2),
    shape('line', { x1: 150, y1: 8, x2: 150, y2: 292 }, 3),
    shape('circle', { cx: 246, cy: 150, r: 5 }, 4, true),
  ],
  story: [
    shape('path', { d: 'M52 244 L52 150 A98 98 0 0 1 248 150 L248 244' }, 0),
    shape('line', { x1: 6, y1: 244, x2: 294, y2: 244 }, 1),
    shape('path', { d: 'M86 244 L86 150 A64 64 0 0 1 214 150 L214 244' }, 2),
    shape('circle', { cx: 150, cy: 30, r: 6 }, 3, true),
  ],
  contact: [
    shape('path', { d: 'M78 272 L78 146 A72 72 0 0 1 222 146 L222 272' }, 0),
    shape('line', { x1: 8, y1: 272, x2: 292, y2: 272 }, 1),
    shape('circle', { cx: 150, cy: 150, r: 66 }, 2, true),
    shape('line', { x1: 150, y1: 12, x2: 150, y2: 40 }, 3),
  ],
}

export default function LineArt({ variant }) {
  return (
    <svg
      className="lineart"
      viewBox="0 0 300 300"
      aria-hidden="true"
      focusable="false"
    >
      {VARIANTS[variant]}
    </svg>
  )
}
