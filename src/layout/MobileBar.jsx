import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CoverMark from '../components/CoverMark'
import Mascot from '../components/Mascot'
import { artist } from '../data/content'
import { prepareTrackClick } from '../lib/trackNav'
import Links from './Links'
import ReplayLink from './ReplayLink'
import Tracklist from './Tracklist'

const DESKTOP = '(min-width: 900px)'

/* Below 900px the artist panel becomes a compact top bar. "Menu" opens a
   panel with the tracklist, links and the mascot (which has no room in
   the compact player bar). Escape closes it and returns focus. */
export default function MobileBar() {
  const panelId = useId()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return undefined

    const html = document.documentElement
    html.style.overflow = 'hidden'
    panelRef.current?.querySelector('a[href]')?.focus()

    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const desktop = window.matchMedia(DESKTOP)
    const onResize = (event) => {
      if (event.matches) setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => {
      html.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onResize)
    }
  }, [open])

  return (
    <header className="topbar" data-open={open ? 'true' : 'false'}>
      <div className="topbar__bar">
        <Link
          to="/work"
          viewTransition
          className="topbar__brand"
          onClick={() => {
            prepareTrackClick(pathname, '/work')
            close()
          }}
        >
          <CoverMark size={30} />
          <span className="topbar__name">{artist.name}</span>
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className="topbar__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="topbar__toggle-icon" aria-hidden="true" />
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div id={panelId} className="topbar__panel" ref={panelRef} hidden={!open}>
        <p className="sidebar__sub">{artist.subline}</p>
        <Tracklist onNavigate={close} />
        <Links onNavigate={close} />
        <div className="sidebar__meta">
          <ReplayLink onNavigate={close} />
        </div>
        <div className="topbar__mascot">
          <Mascot size={72} />
        </div>
      </div>
    </header>
  )
}
