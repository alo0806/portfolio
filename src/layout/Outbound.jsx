import { useId } from 'react'

/* Placeholders: swap in real URLs. A '#' href is treated as "not yet". */
const LINKS = [
  { label: 'Email', href: 'mailto:hello@astnlo.com' },
  { label: 'LinkedIn', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Resume', href: '#' },
]

export default function Outbound({ onNavigate }) {
  const labelId = useId()

  return (
    <nav className="outbound" aria-labelledby={labelId}>
      <p className="mono panel-label" id={labelId}>
        Outbound
      </p>
      <ul className="outbound__list">
        {LINKS.map(({ label, href }) => {
          const external = href.startsWith('http')
          return (
            <li key={label}>
              <a
                className="outbound__link"
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={(event) => {
                  if (href === '#') event.preventDefault()
                  else onNavigate?.()
                }}
              >
                <span>{label}</span>
                <span className="outbound__arrow" aria-hidden="true">
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
