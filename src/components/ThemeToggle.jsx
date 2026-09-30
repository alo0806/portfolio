import { useRef } from 'react'
import { duration, ease, prefersReducedMotion } from '../lib/motion'
import { setTheme, useTheme } from '../lib/theme'
import { MoonIcon, SunIcon } from './icons'
import './ThemeToggle.css'

/* Moon in light mode, sun in dark. The new theme wipes in as a circle
   growing from the button — the iris, in miniature — using a View
   Transition. Without View Transitions, or with reduced motion, it just
   switches. Every instance stays in sync through the shared theme store. */
export default function ThemeToggle({ className = '' }) {
  const theme = useTheme()
  const dark = theme === 'dark'
  const buttonRef = useRef(null)

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    const html = document.documentElement
    const canWipe =
      typeof document.startViewTransition === 'function' &&
      !prefersReducedMotion() &&
      !html.dataset.vt // don't cut into another transition

    if (!canWipe) {
      setTheme(next)
      return
    }

    const rect = buttonRef.current.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    html.dataset.vt = 'theme'
    const transition = document.startViewTransition(() => setTheme(next))
    transition.ready
      .then(() => {
        html.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: duration('slow'), easing: ease('in-out'), pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
    transition.finished
      .catch(() => {})
      .finally(() => {
        if (html.dataset.vt === 'theme') delete html.dataset.vt
      })
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-pressed={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
    >
      <span className="theme-toggle__icons" data-showing={dark ? 'sun' : 'moon'} aria-hidden="true">
        <MoonIcon className="theme-toggle__moon" />
        <SunIcon className="theme-toggle__sun" />
      </span>
    </button>
  )
}
