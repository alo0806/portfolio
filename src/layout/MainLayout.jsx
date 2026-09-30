import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PlayerBar from '../components/player/PlayerBar'
import { cancelAnimations, ease, prefersReducedMotion } from '../lib/motion'
import { clearEntranceCue, markIntroSeen } from '../lib/session'
import { trackLanded } from '../lib/trackNav'
import MobileBar from './MobileBar'
import Sidebar from './Sidebar'
import './Layout.css'

const SCRUB_MS = 560

/* The artist panel and player bar stay put; only the content area swaps.
   The page wrapper is keyed by path so each page remounts and replays its
   entrance, and it carries the view-transition name the outgoing page
   slides out on.

   data-entrance choreographs how the layout itself arrives:
     iris   — just came through the iris: panel slides in, tracks load
              one by one, the equalizer pops, the player rises, and the
              page content comes last
     direct — a direct link or reload: a quicker, quieter arrival
     done   — set once the arrival has played, so later page switches
              don't repeat it */
export default function MainLayout() {
  const { pathname, state } = useLocation()
  const [entrance] = useState(() => (state?.entrance === 'iris' ? 'iris' : 'direct'))
  const layoutRef = useRef(null)
  const mainRef = useRef(null)
  const scrubRef = useRef(null)
  const firstRender = useRef(true)

  // Arriving here at all counts as having been through the door.
  useEffect(() => {
    markIntroSeen()
    clearEntranceCue()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        if (layoutRef.current) layoutRef.current.dataset.entrance = 'done'
      },
      entrance === 'iris' ? 1900 : 900,
    )
    return () => window.clearTimeout(timer)
  }, [entrance])

  useEffect(() => {
    trackLanded(pathname)
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    // Back to the top, and focus the content so keyboard and screen
    // reader users land on the new page.
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })

    // A thin playhead sweeps across the content area in the direction of
    // travel. Cancelled and restarted if tracks change mid-sweep.
    const scrub = scrubRef.current
    if (!scrub || prefersReducedMotion()) return
    const width = scrub.parentElement.getBoundingClientRect().width
    const forward = document.documentElement.dataset.trackDir !== 'prev'
    const from = forward ? -120 : width + 20
    const to = forward ? width + 20 : -120
    cancelAnimations(scrub)
    scrub.animate(
      [
        { transform: `translateX(${from}px)`, opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { opacity: 1, offset: 0.8 },
        { transform: `translateX(${to}px)`, opacity: 0 },
      ],
      { duration: SCRUB_MS, easing: ease('in-out') },
    )
  }, [pathname])

  return (
    <div className="layout" data-surface="light" data-entrance={entrance} ref={layoutRef}>
      <Sidebar />
      <MobileBar />
      <main id="main" className="layout__main" ref={mainRef} tabIndex={-1}>
        <div className="layout__page page" key={pathname} data-rm-fade="">
          <Outlet />
        </div>
      </main>
      <div className="scrub-lane" aria-hidden="true">
        <div className="scrub" ref={scrubRef}>
          <svg className="scrub__wave" viewBox="0 0 120 40" preserveAspectRatio="none">
            <path d="M0 20 Q7 6 14 20 T28 20 T42 20 T56 20 T70 20 T84 20 T98 20 T112 20 T120 20" />
          </svg>
          <span className="scrub__line" />
        </div>
      </div>
      <PlayerBar />
    </div>
  )
}
