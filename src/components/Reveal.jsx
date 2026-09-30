import { useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

/* Rises into view behind a mask the first time it's scrolled to — once,
   never again. Anything already on screen when it mounts is shown at
   once (the page's own entrance covers it), so nothing animates twice. */
export default function Reveal({ as: Tag = 'div', children, ...props }) {
  const ref = useRef(null)

  // Before first paint, so an item waiting below the fold never flashes.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const onScreen = el.getBoundingClientRect().top < window.innerHeight * 0.95
    if (onScreen || prefersReducedMotion()) {
      el.dataset.reveal = 'shown'
      return undefined
    }

    el.dataset.reveal = 'pending'
    el.dataset.revealMode = 'scroll' // stays: opts out of the page stagger
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.dataset.reveal = 'shown'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  )
}
