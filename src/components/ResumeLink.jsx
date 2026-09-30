import { useEffect, useId, useRef, useState } from 'react'
import { links, resume } from '../data/content'
import useReducedMotion from '../hooks/useReducedMotion'
import { sound } from '../sound/engine'
import { CloseIcon, LockIcon, ResumeIcon } from './icons'
import './ResumeLink.css'

const EMAIL = links.find((link) => link.icon === 'email')?.href

const MESSAGES = {
  wrong: resume.wrong,
  'too-many': resume.tooMany,
  unavailable: resume.unavailable,
}

/* The "Resume" link and the box it opens: the resume as a "locked
   track" — one code field and an Unlock button.
   The code is checked on the server (/api/resume), which sends the PDF
   back only when it matches; it opens in a new tab.

   A native modal <dialog>: the page behind is inert (focus stays inside),
   Esc closes it, and focus returns to whatever opened it. Errors are
   announced (role="alert"); a wrong code shakes the box and, with sound
   on, scratches the record. */
export default function ResumeLink({ label }) {
  const titleId = useId()
  const promptId = useId()
  const messageId = useId()
  const inputId = useId()
  const dialogRef = useRef(null)
  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const openerRef = useRef(null)
  const pdfUrlRef = useRef(null)
  const openLinkRef = useRef(null)
  const reduced = useReducedMotion()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | wrong | too-many | unavailable | blocked
  const [pdfUrl, setPdfUrl] = useState(null)

  // Opened straight from the click (no state in between to fall behind).
  const openDialog = (event) => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    openerRef.current = event.currentTarget
    dialog.showModal()
    inputRef.current?.focus()
  }

  // Esc, the close button or the backdrop: reset, and hand focus back.
  const onDialogClose = () => {
    setStatus((current) => (current === 'checking' ? current : 'idle'))
    setCode('')
    openerRef.current?.focus()
  }

  // The unlocked PDF lives in a blob URL; free it when we're done.
  useEffect(
    () => () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    },
    [],
  )

  const fail = (kind) => {
    setStatus(kind)
    if (kind !== 'unavailable') sound.scratch()
    if (!reduced) {
      panelRef.current?.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-8px)' },
          { transform: 'translateX(7px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(2px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 380, easing: 'ease-out' },
      )
    }
    inputRef.current?.select()
  }

  const submit = async (event) => {
    event.preventDefault()
    if (status === 'checking' || !code) return
    setStatus('checking')
    let response
    try {
      response = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: code }),
        cache: 'no-store',
      })
    } catch {
      fail('unavailable')
      return
    }

    if (response.status === 401) return fail('wrong')
    if (response.status === 429) return fail('too-many')
    const type = response.headers.get('Content-Type') ?? ''
    if (!response.ok || !type.includes('application/pdf')) return fail('unavailable')

    const blob = await response.blob()
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    const url = URL.createObjectURL(blob)
    pdfUrlRef.current = url
    setPdfUrl(url)
    setCode('')

    const tab = window.open(url, '_blank')
    if (tab) {
      setStatus('idle')
      dialogRef.current?.close()
    } else {
      // The browser blocked the new tab (common after a network wait,
      // e.g. Safari): offer a real link, focused, so Enter opens it.
      setStatus('blocked')
    }
  }

  useEffect(() => {
    if (status === 'blocked') openLinkRef.current?.focus()
  }, [status])

  const message = MESSAGES[status]
  const checking = status === 'checking'

  return (
    <>
      <button
        type="button"
        className="links__link u-line"
        aria-haspopup="dialog"
        onClick={openDialog}
      >
        <ResumeIcon className="links__icon" width={16} height={16} />
        <span>{label}</span>
        <LockIcon className="links__lock" width={12} height={12} />
        <span className="sr-only"> (code required)</span>
      </button>
      <dialog
        ref={dialogRef}
        className="resume"
        aria-labelledby={titleId}
        aria-describedby={promptId}
        onClose={onDialogClose}
        onClick={(event) => {
          // A click on the backdrop (the dialog box itself, outside the panel) closes it.
          if (event.target === dialogRef.current) dialogRef.current.close()
        }}
      >
        <div className="resume__panel" ref={panelRef}>
          <button
            type="button"
            className="resume__close"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
          >
            <CloseIcon width={18} height={18} />
          </button>

          <div className="resume__head">
            <span className="resume__cover" aria-hidden="true">
              <LockIcon width={26} height={26} />
            </span>
            <div>
              <p className="resume__label">{resume.label}</p>
              <h2 className="resume__title" id={titleId}>
                {resume.title}
              </h2>
            </div>
          </div>

          <form className="resume__form" onSubmit={submit} noValidate>
            <p className="resume__prompt" id={promptId}>
              {resume.prompt}
            </p>
            <label className="resume__field-label" htmlFor={inputId}>
              {resume.field}
            </label>
            <div className="resume__row">
              <input
                ref={inputRef}
                id={inputId}
                className="resume__input"
                type="password"
                name="code"
                autoComplete="off"
                spellCheck="false"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                aria-invalid={status === 'wrong' || status === 'too-many' ? 'true' : undefined}
                aria-describedby={message ? messageId : undefined}
                disabled={status === 'too-many'}
              />
              <button
                type="submit"
                className="resume__unlock"
                disabled={checking || !code || status === 'too-many'}
              >
                {checking ? resume.unlocking : resume.unlock}
              </button>
            </div>
            <p className="resume__message" id={messageId} role="alert">
              {message ?? null}
              {status === 'blocked' ? resume.blocked : null}
            </p>
            {status === 'blocked' && pdfUrl ? (
              <a
                ref={openLinkRef}
                className="resume__open"
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => dialogRef.current?.close()}
              >
                {resume.open} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </form>

          {EMAIL ? (
            <p className="resume__fallback">
              {resume.fallback}{' '}
              <a className="u-line" href={EMAIL}>
                {resume.fallbackLink}
              </a>
            </p>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
