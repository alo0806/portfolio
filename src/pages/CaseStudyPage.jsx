import { Fragment } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AlbumCover from '../components/AlbumCover'
import Reveal from '../components/Reveal'
import Chart from './CaseCharts'
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

const paragraphs = (text) =>
  [text].flat().filter(Boolean).map((paragraph, k) => (
    <p key={k} className="case__text">
      {paragraph}
    </p>
  ))

/* One piece of media with its caption. With `href` (a video's cover that
   links to the original post), the picture is the link, with a play
   badge, and opens in a new tab. */
function Figure({ item }) {
  return (
    <figure className="media-figure">
      {item.href ? (
        <a className="case__post" href={item.href} target="_blank" rel="noreferrer">
          <Media item={item} />
          <span className="case__post-badge" aria-hidden="true">
            ▶
          </span>
          <span className="sr-only">{item.linkLabel ?? 'Watch the original post'} (opens in a new tab)</span>
        </a>
      ) : (
        <Media item={item} />
      )}
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
  )
}

/* A Single's case study, at /work/<slug>: the header (tag, title, role,
   year, metrics), then Context, My role, Process (steps, each with an
   optional title, one or more paragraphs, a chart, then its images and
   videos, and optionally its own findings, each with a small chart)
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
          {caseStudy.summary ? <p className="case__summary">{caseStudy.summary}</p> : null}
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
        {paragraphs(caseStudy.context)}
      </Reveal>

      <Reveal as="section" className="case__part" aria-labelledby="case-role">
        <h2 className="case__heading" id="case-role">
          My role
        </h2>
        {paragraphs(caseStudy.role)}
      </Reveal>

      <section className="case__part" aria-labelledby="case-process">
        <Reveal>
          <h2 className="case__heading" id="case-process">
            Process
          </h2>
        </Reveal>
        {caseStudy.process.map((block, i) => (
          <Fragment key={i}>
            <Reveal className="case__block">
              {block.title ? <h3 className="case__subheading">{block.title}</h3> : null}
              {paragraphs(block.text)}
              {block.chart ? <Chart chart={block.chart} /> : null}
              {block.media?.length ? (
                <div className="case__media" data-count={Math.min(block.media.length, 4)}>
                  {block.media.map((item, j) => (
                    <Figure key={j} item={item} />
                  ))}
                </div>
              ) : null}
            </Reveal>
            {block.findings?.map((finding, k) => (
              <Reveal key={k} className="case__block case__finding">
                <h4 className="case__finding-title">{finding.title}</h4>
                {paragraphs(finding.text)}
                {finding.chart ? <Chart chart={finding.chart} /> : null}
              </Reveal>
            ))}
          </Fragment>
        ))}
      </section>

      {caseStudy.findings?.length ? (
        <section className="case__part" aria-labelledby="case-findings">
          <Reveal>
            <h2 className="case__heading" id="case-findings">
              What worked
            </h2>
          </Reveal>
          {caseStudy.findings.map((finding, i) => (
            <Reveal key={i} className="case__block">
              {finding.title ? <h3 className="case__subheading">{finding.title}</h3> : null}
              {paragraphs(finding.text)}
              {finding.chart ? <Chart chart={finding.chart} /> : null}
            </Reveal>
          ))}
        </section>
      ) : null}

      {caseStudy.decisions?.length ? (
        <Reveal as="section" className="case__part" aria-labelledby="case-decisions">
          <h2 className="case__heading" id="case-decisions">
            Decisions &amp; tradeoffs
          </h2>
          <dl className="case__decisions">
            {caseStudy.decisions.map(({ decision, why }) => (
              <div key={decision} className="case__decision">
                <dt>{decision}</dt>
                <dd>{why}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      ) : null}

      <Reveal as="section" className="case__part" aria-labelledby="case-outcome">
        <h2 className="case__heading" id="case-outcome">
          Outcome
        </h2>
        {paragraphs(caseStudy.outcome)}
        {[caseStudy.differently ?? []].flat().map((paragraph, k) => (
          <p key={k} className="case__text">
            {k === 0 ? <strong className="case__lead">What I’d do differently: </strong> : null}
            {paragraph}
          </p>
        ))}
        <Metrics items={caseStudy.outcomeMetrics} className="case__metrics--outcome" />
      </Reveal>

      {caseStudy.numbers?.length ? (
        <Reveal as="section" className="case__part" aria-labelledby="case-numbers">
          <h2 className="case__heading" id="case-numbers">
            By the numbers
          </h2>
          <dl className="case__numbers">
            {caseStudy.numbers.map(({ value, label, context }) => (
              <div key={label} className="case__number">
                <dt>{label}</dt>
                <dd className="case__number-value">{value}</dd>
                <dd className="case__number-context">{context}</dd>
              </div>
            ))}
          </dl>
          {caseStudy.numbersNote ? <p className="case__note">{caseStudy.numbersNote}</p> : null}
        </Reveal>
      ) : null}

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
