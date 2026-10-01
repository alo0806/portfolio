import { useRef } from 'react'
import { Link } from 'react-router-dom'
import AlbumCover from '../components/AlbumCover'
import useFinePointer from '../hooks/useFinePointer'
import useReducedMotion from '../hooks/useReducedMotion'
import { setTrackDirection } from '../lib/trackNav'
import { sound } from '../sound/engine'

const MAX_TILT = 7 // degrees

/* A Single as an album: cover, a plain tag, title, role and year, one
   line, and three metrics — laid out so a recruiter can scan tag and
   numbers at a glance. The whole card opens its case study: the title is
   the link, stretched over the card, so there's one stop per card for
   keyboard and screen reader users.

   On a mouse or trackpad the card tilts toward the cursor, a light sheen
   sweeps the cover on hover, and it presses in softly. Touch devices and
   reduced motion get a still card. */
export default function AlbumCard({ number, project }) {
  const { slug, title, tag, role, year, oneLiner, metrics, cover } = project
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
      <AlbumCover title={title} number={number} cover={cover} />
      <div className="album__body">
        <p className="album__tag">{tag}</p>
        <h3 className="album__title">
          <Link
            to={`/work/${slug}`}
            viewTransition
            className="album__link"
            onClick={() => setTrackDirection('next')}
          >
            {title}
          </Link>
        </h3>
        <p className="album__role">
          {role}
          {year && year !== '—' ? ` · ${year}` : ''}
        </p>
        <p className="album__desc">{oneLiner}</p>
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
