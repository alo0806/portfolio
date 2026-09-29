import { useEffect, useState } from 'react'
import { useActiveSection } from '../context/sectionContexts'
import './Nav.css'

const LINKS = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

/* Barely there: no bar, no blur. It steps out of the way while you read
   downward and comes back the moment you scroll up (or tab into it). */
export default function Nav() {
  const active = useActiveSection()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < 6) return
      setHidden(delta > 0 && y > 160)
      lastY = y
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className="nav" data-hidden={hidden ? 'true' : 'false'}>
      <div className="shell nav__shell">
        <a className="ui-label nav__mark" href="#hero">
          Austin
        </a>
        <nav aria-label="Sections">
          <ul className="nav__links">
            {LINKS.map(({ id, label }) => (
              <li key={id}>
                <a
                  className="ui-label nav__link"
                  href={`#${id}`}
                  aria-current={active === id ? 'true' : undefined}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
