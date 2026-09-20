import { useActiveSection } from '../context/sectionContexts'
import './Nav.css'

const LINKS = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const active = useActiveSection()

  return (
    <header className="nav">
      <div className="nav__shell shell">
        <a className="nav__mark" href="#hero">
          Austin
        </a>
        <nav aria-label="Sections">
          <ul className="nav__links">
            {LINKS.map(({ id, label }) => (
              <li key={id}>
                <a
                  className="nav__link"
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
