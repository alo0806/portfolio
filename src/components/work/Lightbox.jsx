import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { fullInset, insetsBetween } from '../../lib/growOverlay'
import { duration, ease, prefersReducedMotion } from '../../lib/motion'
import { sound } from '../../sound/engine'
import { CloseIcon } from '../SymmetryDraw/icons'
import { NextIcon, PrevIcon } from '../icons'
import Media from './Media'
import './Lightbox.css'

const SWIPE = 50 // px of horizontal travel that counts as a swipe

/* A project's gallery, opened over the page: its title, role and one
   line, then its media one at a time with the caption underneath.
   ←/→ (or a swipe, or the buttons) move between items; Esc or × closes.

   Like the drawing toy, it grows out of the card that opened it and
   shrinks back into it. It's rendered at the top of <body>, above the
   player bar and sidebar, and the rest of the site is made inert while
   it's open — so focus stays inside — then focus goes back to the card's
   button. Under reduced motion it just appears and disappears. */
export default function Lightbox({ project, card, returnTo, onClosed }) {
  const titleId = useId()
  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const stageRef = useRef(null)
  const closingRef = useRef(false)
  const swipeRef = useRef(null)
  const [index, setIndex] = useState(0)
  const media = project.media ?? []
  const item = media[index]
  const count = media.length

  // Lock the page behind, and grow out of the card.
  useLayoutEffect(() => {
    const root = document.getElementById('root')
    const html = document.documentElement
    root?.setAttribute('inert', '')
    html.style.overflow = 'hidden'
    panelRef.current?.focus({ preventScroll: true })

    const from = card?.getBoundingClientRect()
    const to = panelRef.current?.getBoundingClientRect()
    if (from && to && !prefersReducedMotion()) {
      const options = { duration: duration('base'), easing: ease('out') }
      panelRef.current.animate([{ clipPath: insetsBetween(to, from) }, { clipPath: fullInset() }], options)
      backdropRef.current.animate([{ opacity: 0 }, { opacity: 1 }], options)
    }

    return () => {
      root?.removeAttribute('inert')
      html.style.overflow = ''
      // Back to the card — only possible once the page isn't inert.
      returnTo?.focus({ preventScroll: true })
    }
  }, [card, returnTo])

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    const from = card?.getBoundingClientRect()
    const to = panelRef.current?.getBoundingClientRect()
    if (!from || !to || prefersReducedMotion()) {
      onClosed()
      return
    }
    const options = { duration: duration('base'), easing: ease('in-out'), fill: 'forwards' }
    backdropRef.current.animate([{ opacity: 1 }, { opacity: 0 }], options)
    panelRef.current
      .animate([{ clipPath: fullInset() }, { clipPath: insetsBetween(to, from) }], options)
      .finished.then(onClosed, onClosed)
  }, [card, onClosed])

  // Move by `step`, wrapping; the new item slides in from that side.
  const go = useCallback(
    (step) => {
      if (count < 2) return
      setIndex((current) => (current + step + count) % count)
      sound.click()
      const stage = stageRef.current
      if (stage && !prefersReducedMotion()) {
        stage.getAnimations().forEach((animation) => animation.cancel())
        stage.animate(
          [
            { opacity: 0, transform: `translateX(${step * 24}px)` },
            { opacity: 1, transform: 'none' },
          ],
          { duration: duration('base'), easing: ease('out') },
        )
      }
    },
    [count],
  )

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, go])

  // Swipe: a mostly-horizontal drag on the media.
  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse') return
    swipeRef.current = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  }

  return createPortal(
    <div className="lightbox" role="presentation">
      <div className="lightbox__backdrop" ref={backdropRef} onClick={close} />
      <div
        className="lightbox__panel"
        data-surface="dark"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="lightbox__head">
          <div>
            <h2 className="lightbox__title" id={titleId}>
              {project.title}
            </h2>
            <p className="lightbox__role">
              {project.role}
              {project.year && project.year !== '—' ? ` · ${project.year}` : ''}
            </p>
            <p className="lightbox__line">{project.oneLiner}</p>
          </div>
          <button type="button" className="lightbox__close" aria-label="Close" onClick={close}>
            <CloseIcon />
          </button>
        </header>

        {item ? (
          <figure className="lightbox__figure">
            <div
              className="lightbox__stage"
              ref={stageRef}
              style={{ '--r': (item.ratio ?? '16/9').replace('/', ' / ') }}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                swipeRef.current = null
              }}
            >
              <Media key={index} item={item} fit="contain" className="lightbox__media" />
            </div>
            <figcaption className="lightbox__caption" aria-live="polite">
              {count > 1 ? (
                <span className="lightbox__count num">
                  {index + 1} / {count}
                </span>
              ) : null}
              {item.caption ? <span>{item.caption}</span> : null}
            </figcaption>
          </figure>
        ) : (
          <p className="lightbox__empty">Nothing to show here yet.</p>
        )}

        {count > 1 ? (
          <div className="lightbox__nav">
            <button type="button" className="lightbox__step" aria-label="Previous" onClick={() => go(-1)}>
              <PrevIcon />
            </button>
            <button type="button" className="lightbox__step" aria-label="Next" onClick={() => go(1)}>
              <NextIcon />
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
