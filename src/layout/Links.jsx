import { useId } from 'react'
import { links } from '../data/content'

export default function Links({ onNavigate }) {
  const labelId = useId()

  return (
    <nav className="links" aria-labelledby={labelId}>
      <h2 className="label panel-heading" id={labelId}>
        Links
      </h2>
      <ul className="links__list">
        {links.map(({ label, href }) => {
          const external = href.startsWith('http')
          return (
            <li key={label}>
              <a
                className="links__link"
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={(event) => {
                  if (href === '#') event.preventDefault()
                  else onNavigate?.()
                }}
              >
                <span>{label}</span>
                <span className="links__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
