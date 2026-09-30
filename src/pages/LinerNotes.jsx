import { linerNotes, work } from '../data/content'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/* The latest liner-notes entry (content.js keeps them newest first). */
export default function LinerNotes() {
  const latest = linerNotes[0]
  if (!latest) return null
  const date = new Date(`${latest.date}T12:00:00`)

  return (
    <article className="notes" data-surface="dark" aria-labelledby="liner-notes-title">
      <div className="notes__head">
        <h2 className="notes__title" id="liner-notes-title">
          {work.linerNotesTitle}
        </h2>
        <time className="notes__date num" dateTime={latest.date}>
          {dateFormat.format(date)}
        </time>
      </div>
      <p className="notes__body">{latest.text}</p>
      <a className="notes__all" href="#" onClick={(event) => event.preventDefault()}>
        {work.allNotesLabel} <span aria-hidden="true">→</span>
      </a>
      <span className="notes__groove" aria-hidden="true" />
    </article>
  )
}
