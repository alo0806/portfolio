import { Link, Navigate, useParams } from 'react-router-dom'
import AlbumCover from '../components/AlbumCover'
import Reveal from '../components/Reveal'
import Media from '../components/work/Media'
import { NextIcon, PrevIcon } from '../components/icons'
import { projects } from '../data/content'
import { setTrackDirection } from '../lib/trackNav'
import usePageTitle from './usePageTitle'
import './CaseStudyPage.css'

const singles = projects.filter((project) => project.section === 'singles' && project.caseStudy)

function Metrics({ items, className }) {
  if (!items?.length) return null
  return (
    <dl className={`case__metrics ${className ?? ''}`.trim()}>
      {items.map(({ label, value }) => (
        <div key={label} className="case__metric">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Figure({ item }) {
  return (
    <figure className="media-figure">
      <Media item={item} />
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
  )
}

/* A Single's case study, at /work/<slug>: the header (tag, title, role,
   year, metrics), then Context, My role, Process (steps, each with an
   optional title, one or more paragraphs, then its images and videos)
   and Outcome. It's part of the My Work track — the
   sidebar keeps My Work lit — and opening it, or the next case study,
   slides forward like changing track; "Back to tracklist" and the
   previous one slide back. Any other slug goes to My Work. */
export default function CaseStudyPage() {
  const { slug } = useParams()
  const index = singles.findIndex((project) => project.slug === slug)
  const project = singles[index]
  usePageTitle(project?.title)

  if (!project) return <Navigate to="/work" replace />

  const { title, tag, role, year, metrics, cover, caseStudy } = project
  const prev = singles[(index - 1 + singles.length) % singles.length]
  const next = singles[(index + 1) % singles.length]
  const many = singles.length > 1

  return (
    <article className="case">
      <Link to="/work" viewTransition className="case__back u-line" onClick={() => setTrackDirection('prev')}>
        <span aria-hidden="true">←</span> Back to tracklist
      </Link>

      <header className="case__head">
        <div className="case__cover">
          <AlbumCover title={title} number={index + 1} cover={cover} />
        </div>
        <div className="case__intro">
          <p className="case__tag">{tag}</p>
          <h1 className="case__title">{title}</h1>
          <p className="case__role">
            {role}
            {year && year !== '—' ? ` · ${year}` : ''}
          </p>
          <Metrics items={metrics} />
        </div>
      </header>

      <Reveal as="section" className="case__part" aria-labelledby="case-context">
        <h2 className="case__heading" id="case-context">
          Context
        </h2>
        {[caseStudy.context].flat().map((paragraph, k) => (
          <p key={k} className="case__text">
            {paragraph}
          </p>
        ))}
      </Reveal>

      <Reveal as="section" className="case__part" aria-labelledby="case-role">
        <h2 className="case__heading" id="case-role">
          My role
        </h2>
        {[caseStudy.role].flat().map((paragraph, k) => (
          <p key={k} className="case__text">
            {paragraph}
          </p>
        ))}
      </Reveal>

      <section className="case__part" aria-labelledby="case-process">
        <Reveal>
          <h2 className="case__heading" id="case-process">
            Process
          </h2>
        </Reveal>
        {caseStudy.process.map((block, i) => (
          <Reveal key={i} className="case__block">
            {block.title ? <h3 className="case__subheading">{block.title}</h3> : null}
            {[block.text].flat().map((paragraph, k) => (
              <p key={k} className="case__text">
                {paragraph}
              </p>
            ))}
            {block.media?.length ? (
              <div className="case__media" data-count={Math.min(block.media.length, 2)}>
                {block.media.map((item, j) => (
                  <Figure key={j} item={item} />
                ))}
              </div>
            ) : null}
          </Reveal>
        ))}
      </section>

      <Reveal as="section" className="case__part" aria-labelledby="case-outcome">
        <h2 className="case__heading" id="case-outcome">
          Outcome
        </h2>
        {[caseStudy.outcome].flat().map((paragraph, k) => (
          <p key={k} className="case__text">
            {paragraph}
          </p>
        ))}
        <Metrics items={caseStudy.outcomeMetrics} className="case__metrics--outcome" />
      </Reveal>

      {many ? (
        <nav className="case__nav" aria-label="More case studies">
          <Link
            to={`/work/${prev.slug}`}
            viewTransition
            className="case__step"
            onClick={() => setTrackDirection('prev')}
          >
            <PrevIcon aria-hidden="true" />
            <span>
              <span className="case__step-label">Previous</span>
              <span className="case__step-title">{prev.title}</span>
            </span>
          </Link>
          <Link
            to={`/work/${next.slug}`}
            viewTransition
            className="case__step case__step--next"
            onClick={() => setTrackDirection('next')}
          >
            <span>
              <span className="case__step-label">Next</span>
              <span className="case__step-title">{next.title}</span>
            </span>
            <NextIcon aria-hidden="true" />
          </Link>
        </nav>
      ) : null}
    </article>
  )
}
