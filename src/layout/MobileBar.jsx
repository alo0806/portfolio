import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Clock from '../components/Clock'
import LogoMark from '../components/LogoMark'
import Mascot from '../components/Mascot'
import Explore from './Explore'
import Outbound from './Outbound'
import ReplayLink from './ReplayLink'

const DESKTOP = '(min-width: 900px)'

/* Below 900px the sidebar becomes a compact top bar. "Menu" opens a panel
   holding everything the sidebar had. Escape closes it and returns focus
   to the button; choosing a page closes it too. */
export default function MobileBar() {
  const panelId = useId()
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
        <Link to="/work" viewTransition className="topbar__brand" onClick={close}>
          <LogoMark size={28} />
          <span className="topbar__name">Austin Lo</span>
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className="mono topbar__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="topbar__toggle-icon" aria-hidden="true" />
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div id={panelId} className="topbar__panel" ref={panelRef} hidden={!open}>
        <p className="mono sidebar__sub">Cognitive Science @ UCLA</p>
        <Explore onNavigate={close} />
        <Outbound onNavigate={close} />
        <div className="sidebar__meta">
          <ReplayLink onNavigate={close} />
          <Clock />
        </div>
        <Mascot />
      </div>
    </header>
  )
}
