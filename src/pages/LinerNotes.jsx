import { Fragment, useEffect, useState } from 'react'
import { linerNotes, work } from '../data/content'
import { prefersReducedMotion } from '../lib/motion'

const TYPED_KEY = 'astnlo:notes-typed'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function alreadyTyped() {
  try {
    return window.sessionStorage.getItem(TYPED_KEY) === '1'
  } catch {
    return true // can't remember it, so don't repeat it
  }
}

/* The text is laid out in full from the start; each character just fades
   in on its turn. Nothing reflows while it "types", and screen readers
   get the whole sentence at once from the hidden copy. */
function TypedText({ text }) {
  let index = 0
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={`${word}-${w}`}>
            <span className="typed-word">
              {[...word].map((char) => {
                const i = index
                index += 1
                return (
                  <span key={i} className="typed-char" style={{ '--c': i }}>
                    {char}
                  </span>
                )
              })}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </>
  )
}

/* The latest liner-notes entry (content.js keeps them newest first). It
   types itself in the first time it appears in a session. */
export default function LinerNotes() {
  const latest = linerNotes[0]
  const [typing] = useState(() => !prefersReducedMotion() && !alreadyTyped())

  useEffect(() => {
    if (!typing) return
    try {
      window.sessionStorage.setItem(TYPED_KEY, '1')
    } catch {
      // Not remembered; harmless.
    }
  }, [typing])

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
      <p className="notes__body" data-typing={typing ? 'true' : 'false'}>
        {typing ? <TypedText text={latest.text} /> : latest.text}
      </p>
      <a className="notes__all u-line" href="#" onClick={(event) => event.preventDefault()}>
        {work.allNotesLabel} <span aria-hidden="true">→</span>
      </a>
      <span className="notes__groove" aria-hidden="true" />
    </article>
  )
}
