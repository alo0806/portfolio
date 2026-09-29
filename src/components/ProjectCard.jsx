/* A project as a hairline arch with a geometric emblem — no screenshot,
   no filled box. An unfinished project gets an unfinished (dashed) arch. */

const ARCH = 'M6 156 L6 62 A54 54 0 0 1 114 62 L114 156 Z'

const EMBLEMS = {
  circle: <circle cx="60" cy="96" r="20" />,
  triangle: <path d="M60 74 L82 114 L38 114 Z" />,
  crescent: <path d="M72 78 A22 22 0 1 0 72 114 A19 19 0 1 1 72 78 Z" />,
}

export default function ProjectCard({
  numeral,
  title,
  kind,
  blurb,
  tags,
  emblem,
  status,
}) {
  const unfinished = Boolean(status)

  return (
    <li className="project">
      <article className="project__inner">
        <svg
          className={`project__arch${unfinished ? ' is-unfinished' : ''}`}
          viewBox="0 0 120 160"
          aria-hidden="true"
          focusable="false"
        >
          <path className="project__arch-fill" d={ARCH} />
          <path className="project__arch-line" d={ARCH} pathLength="1" />
          <g className="project__emblem">{EMBLEMS[emblem]}</g>
        </svg>
        <div className="project__body">
          <p className="ui-label project__meta">
            <span aria-hidden="true">{numeral}</span>
            <span aria-hidden="true" className="project__dot">
              ·
            </span>
            {kind}
            {status ? <span className="project__status">{status}</span> : null}
          </p>
          <h3 className="project__title">{title}</h3>
          <p className="project__blurb">{blurb}</p>
          <ul className="project__tags" aria-label="Tools">
            {tags.map((tag) => (
              <li key={tag} className="ui-label project__tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  )
}
