import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PlayerBar from '../components/player/PlayerBar'
import { markIntroSeen } from '../lib/session'
import MobileBar from './MobileBar'
import Sidebar from './Sidebar'
import './Layout.css'

/* Sidebar stays put; only the content area swaps. The page wrapper is
   keyed by path so each page remounts and replays its entrance, and it
   carries the view-transition name that the outgoing page fades out on. */
export default function MainLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  // Arriving here at all counts as having been through the door.
  useEffect(() => {
    markIntroSeen()
  }, [])

  // On page switches (not first load): back to top, and move focus to the
  // content so keyboard and screen reader users land on the new page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="layout" data-surface="light">
      <Sidebar />
      <MobileBar />
      <main id="main" className="layout__main" ref={mainRef} tabIndex={-1}>
        <div className="layout__page page" key={pathname}>
          <Outlet />
        </div>
      </main>
      <PlayerBar />
    </div>
  )
}
