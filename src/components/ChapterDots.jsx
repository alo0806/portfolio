import { CHAPTERS } from '../chapters'
import { useEarned } from '../context/sectionContexts'
import './ChapterDots.css'

/* A quiet record of the colors you've found, pinned to the left edge. */
export default function ChapterDots() {
  const earned = useEarned()
  const found = CHAPTERS.filter(({ id }) => earned.includes(id))

  return (
    <ol
      className="dots"
      aria-label={`Colors found: ${found.length} of ${CHAPTERS.length}`}
    >
      {CHAPTERS.map(({ id, label }) => {
        const isEarned = earned.includes(id)
        return (
          <li
            key={id}
            className="dots__dot"
            data-chapter={id}
            data-earned={isEarned ? 'true' : 'false'}
          >
            <span className="sr-only">
              {label}
              {isEarned ? ', found' : ', not yet found'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
