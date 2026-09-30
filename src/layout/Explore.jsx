import { useId, useLayoutEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const ITEMS = [
  { to: '/work', number: '01', label: 'My Work' },
  { to: '/about', number: '02', label: 'About Me' },
  { to: '/playground', number: '03', label: 'Playground' },
]

/* The page switcher. Items are real links (with view transitions); one
   highlight pill glides to whichever item is current. */
export default function Explore({ onNavigate }) {
  const labelId = useId()
  const { pathname } = useLocation()
  const listRef = useRef(null)
  const indicatorRef = useRef(null)

  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (!list || !indicator) return
    const active = list.querySelector('[aria-current="page"]')
    if (!active) {
      indicator.style.opacity = '0'
      return
    }
    indicator.style.opacity = '1'
    indicator.style.height = `${active.offsetHeight}px`
    indicator.style.transform = `translateY(${active.offsetTop}px)`
    // Place it without animating on first paint, then let it glide.
    if (indicator.dataset.ready !== 'true') {
      requestAnimationFrame(() => {
        indicator.dataset.ready = 'true'
      })
    }
  }, [pathname])

  return (
    <nav className="explore" aria-labelledby={labelId}>
      <p className="mono panel-label" id={labelId}>
        Explore
      </p>
      <div className="explore__track">
        <span className="explore__indicator" ref={indicatorRef} aria-hidden="true" />
        <ul className="explore__list" ref={listRef}>
          {ITEMS.map(({ to, number, label }) => (
            <li key={to}>
              <NavLink to={to} viewTransition className="explore__link" onClick={onNavigate}>
                <span className="mono explore__number">{number}.</span>
                <span className="explore__label">{label}</span>
                <span className="explore__arrow" aria-hidden="true">
                  →
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
