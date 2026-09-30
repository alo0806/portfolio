import { useLayoutEffect, useRef } from 'react'
import { duration, prefersReducedMotion } from '../lib/motion'

/* Rises into view behind a mask the first time it's scrolled to — once,
   never again. Anything already on screen when it mounts is shown at once
   (the page's own entrance covers it), so nothing animates twice.

   The clip is removed entirely when the reveal ends ('done'), so a card
   that tilts, lifts or rotates on hover can never be cut off by it. */
export default function Reveal({ as: Tag = 'div', children, ...props }) {
  const ref = useRef(null)

  // Before first paint, so an item waiting below the fold never flashes.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const onScreen = el.getBoundingClientRect().top < window.innerHeight * 0.95
    if (onScreen || prefersReducedMotion()) {
      el.dataset.reveal = 'done'
      return undefined
    }

    el.dataset.reveal = 'pending'
    el.dataset.revealMode = 'scroll' // stays: opts out of the page stagger

    let doneTimer = 0
    const finish = () => {
      window.clearTimeout(doneTimer)
      el.dataset.reveal = 'done'
    }
    const onTransitionEnd = (event) => {
      if (event.target === el && event.propertyName === 'clip-path') finish()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        el.dataset.reveal = 'shown'
        el.addEventListener('transitionend', onTransitionEnd)
        // In case transitionend never arrives (tab hidden, interrupted).
        doneTimer = window.setTimeout(finish, duration('slow') + 150)
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      window.clearTimeout(doneTimer)
      el.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [])

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  )
}
