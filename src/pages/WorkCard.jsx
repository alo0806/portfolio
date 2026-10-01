import { useRef } from 'react'
import AlbumCover from '../components/AlbumCover'
import { sound } from '../sound/engine'

/* A project that opens in the gallery (Features, Deep cuts, Demos, Early
   work). `variant`:
   - 'feature': medium — cover, title, role, one line, and its first
     metric if it has one
   - 'compact': small, for denser grids — cover, title, role; Demos get
     an "In progress" tag
   The title is a button stretched over the card (one stop per card); it
   hands the card and itself to onOpen, so the gallery can grow out of
   the card and return focus to the button. */
export default function WorkCard({ project, number, variant = 'compact', onOpen }) {
  const { title, tag, role, year, oneLiner, metrics, cover, section } = project
  const cardRef = useRef(null)
  const buttonRef = useRef(null)
  const metric = variant === 'feature' ? metrics?.[0] : null
  const inProgress = section === 'demos'

  return (
    <article
      className={`work-card work-card--${variant}`}
      ref={cardRef}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') sound.texture()
      }}
    >
      <AlbumCover title={title} number={number} cover={cover} />
      <div className="work-card__body">
        <p className="work-card__tag" data-progress={inProgress ? 'true' : undefined}>
          {inProgress ? 'In progress' : tag}
        </p>
        <h3 className="work-card__title">
          <button
            type="button"
            className="work-card__open"
            ref={buttonRef}
            aria-haspopup="dialog"
            onClick={() => {
              sound.click()
              onOpen(project, cardRef.current, buttonRef.current)
            }}
          >
            {title}
          </button>
        </h3>
        <p className="work-card__role">
          {role}
          {year && year !== '—' ? ` · ${year}` : ''}
        </p>
        {variant === 'feature' ? <p className="work-card__desc">{oneLiner}</p> : null}
        {metric ? (
          <p className="work-card__metric">
            <span className="work-card__metric-value">{metric.value}</span> {metric.label}
          </p>
        ) : null}
      </div>
    </article>
  )
}
