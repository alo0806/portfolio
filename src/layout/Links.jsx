import { useId } from 'react'
import { EmailIcon, GitHubIcon, LinkedInIcon, ResumeIcon } from '../components/icons'
import { links } from '../data/content'

const ICONS = {
  email: EmailIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  resume: ResumeIcon,
}

export default function Links({ onNavigate }) {
  const labelId = useId()

  return (
    <nav className="links" aria-labelledby={labelId}>
      <h2 className="label panel-heading" id={labelId}>
        Links
      </h2>
      <ul className="links__list">
        {links.map(({ label, href, icon, soon }) => {
          const Icon = ICONS[icon]
          // Not ready yet: same place and shape, but greyed out, with no
          // href (so it isn't a link or a tab stop) and a "soon" tag.
          if (soon) {
            return (
              <li key={label}>
                <a className="links__link links__link--soon" aria-disabled="true">
                  {Icon ? <Icon className="links__icon" width={16} height={16} /> : null}
                  <span>{label}</span>
                  <span className="links__soon">· soon</span>
                </a>
              </li>
            )
          }
          const external = href.startsWith('http')
          return (
            <li key={label}>
              <a
                className="links__link u-line"
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={() => onNavigate?.()}
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
