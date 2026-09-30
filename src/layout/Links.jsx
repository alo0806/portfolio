import { useId } from 'react'
import ResumeLink from '../components/ResumeLink'
import { EmailIcon, GitHubIcon, LinkedInIcon, ResumeIcon } from '../components/icons'
import { links } from '../data/content'

const ICONS = {
  email: EmailIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  resume: ResumeIcon,
}

/* The artist's links. A `locked` link (the resume) is a button that opens
   the code box instead of going anywhere. */
export default function Links({ onNavigate }) {
  const labelId = useId()

  return (
    <nav className="links" aria-labelledby={labelId}>
      <h2 className="label panel-heading" id={labelId}>
        Links
      </h2>
      <ul className="links__list">
        {links.map(({ label, href = '#', icon, locked }) => {
          const external = href.startsWith('http')
          const Icon = ICONS[icon]
          if (locked) {
            return (
              <li key={label}>
                <ResumeLink label={label} />
              </li>
            )
          }
          return (
            <li key={label}>
              <a
                className="links__link u-line"
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={(event) => {
                  if (href === '#') event.preventDefault()
                  else onNavigate?.()
                }}
              >
                {Icon ? <Icon className="links__icon" width={16} height={16} /> : null}
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
