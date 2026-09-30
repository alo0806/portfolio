import { useRef } from 'react'
import AlbumCover from '../components/AlbumCover'
import useFinePointer from '../hooks/useFinePointer'
import useReducedMotion from '../hooks/useReducedMotion'
import { sound } from '../sound/engine'

const MAX_TILT = 7 // degrees

/* A project as an album: cover, a plain tag, title, one line, and three
   metrics — laid out so a recruiter can scan tag and numbers at a glance.

   On a mouse or trackpad the card tilts toward the cursor, a light sheen
   sweeps the cover on hover, and it presses in softly. Touch devices and
   reduced motion get a still card. */
export default function AlbumCard({ number, title, status, tag, description, metrics, cover, image }) {
  const cardRef = useRef(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const tilt = fine && !reduced

  const onPointerMove = (event) => {
    const card = cardRef.current
    if (!tilt || !card) return
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    card.style.setProperty('--ry', `${(x * MAX_TILT * 2).toFixed(2)}deg`)
    card.style.setProperty('--rx', `${(-y * MAX_TILT * 2).toFixed(2)}deg`)
  }

  const onPointerLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  }

  return (
    <article
      className="album"
      ref={cardRef}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') sound.texture()
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <AlbumCover title={title} number={number} cover={cover} image={image} />
      <div className="album__body">
        <p className="album__tag">{tag}</p>
        <h3 className="album__title">
          {title}
          {status ? <span className="album__status"> ({status})</span> : null}
        </h3>
        <p className="album__desc">{description}</p>
        <dl className="album__metrics">
          {metrics.map(({ label, value }) => (
            <div key={label} className="album__metric">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
