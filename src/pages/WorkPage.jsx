import { useCallback, useId, useRef, useState } from 'react'
import Reveal from '../components/Reveal'
import Lightbox from '../components/work/Lightbox'
import { projects, work, workSections } from '../data/content'
import { duration, ease, prefersReducedMotion } from '../lib/motion'
import AlbumCard from './AlbumCard'
import LinerNotes from './LinerNotes'
import PageHead from './PageHead'
import WorkCard from './WorkCard'
import usePageTitle from './usePageTitle'
import './WorkPage.css'

// How each section's cards are drawn.
const LAYOUT = {
  singles: { grid: 'albums', variant: 'album' },
  features: { grid: 'work-grid work-grid--features', variant: 'feature' },
  deepcuts: { grid: 'work-grid work-grid--compact', variant: 'compact' },
  demos: { grid: 'work-grid work-grid--compact', variant: 'compact' },
  archive: { grid: 'work-grid work-grid--compact', variant: 'compact' },
}

/* My Work: the liner notes, then each section of content.js's
   workSections that has projects — Singles (album cards that open a case
   study), then the rest (cards that open the gallery). Early work starts
   collapsed behind a toggle. Card numbers run on across the page. */
export default function WorkPage() {
  usePageTitle(work.title)
  const [gallery, setGallery] = useState(null) // { project, card, button }

  const open = useCallback((project, card, button) => setGallery({ project, card, button }), [])
  const closed = useCallback(() => setGallery(null), [])

  const sections = workSections
    .map((section) => ({ ...section, items: projects.filter((project) => project.section === section.id) }))
    .filter((section) => section.items.length > 0)
  // Cover numbers ("No. 3") run on across the page, in page order.
  const numbered = new Map(sections.flatMap((section) => section.items).map((project, i) => [project.slug, i + 1]))

  return (
    <>
      <PageHead path="/work" title={work.title} />
      <LinerNotes />
      {sections.map((section) => (
        <WorkSection key={section.id} section={section} numbered={numbered} onOpen={open} />
      ))}
      {gallery ? (
        <Lightbox project={gallery.project} card={gallery.card} returnTo={gallery.button} onClosed={closed} />
      ) : null}
    </>
  )
}

function WorkSection({ section, numbered, onOpen }) {
  const titleId = useId()
  const gridId = useId()
  const gridRef = useRef(null)
  const [expanded, setExpanded] = useState(!section.toggle)
  const layout = LAYOUT[section.id] ?? LAYOUT.deepcuts

  const toggle = () => {
    const next = !expanded
    setExpanded(next)
    // Opening: the cards rise in, one after another.
    if (next && !prefersReducedMotion()) {
      requestAnimationFrame(() => {
        gridRef.current?.querySelectorAll(':scope > li').forEach((item, i) => {
          item.animate(
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: duration('base'), easing: ease('out'), delay: i * 50, fill: 'backwards' },
          )
        })
      })
    }
  }

  // A collapsible section animates its own cards in when opened, so they
  // skip the scroll reveal.
  const Item = section.toggle ? 'li' : Reveal
  const cards = section.items.map((project) => {
    const number = numbered.get(project.slug)
    return (
      <Item key={project.slug} {...(section.toggle ? {} : { as: 'li' })}>
        {layout.variant === 'album' ? (
          <AlbumCard number={number} project={project} />
        ) : (
          <WorkCard number={number} project={project} variant={layout.variant} onOpen={onOpen} />
        )}
      </Item>
    )
  })

  return (
    <section className="work-section" aria-labelledby={titleId} data-section={section.id}>
      <header className="work-section__head">
        <h2 className="work-section__title" id={titleId}>
          {section.title}
        </h2>
        <p className="work-section__subtitle">{section.subtitle}</p>
        {section.toggle ? (
          <button
            type="button"
            className="work-section__toggle u-line"
            aria-expanded={expanded}
            aria-controls={gridId}
            onClick={toggle}
          >
            {expanded ? section.toggle.hide : `${section.toggle.show} (${section.items.length})`}
          </button>
        ) : null}
      </header>
      <ul className={layout.grid} id={gridId} ref={gridRef} hidden={!expanded}>
        {expanded ? cards : null}
      </ul>
    </section>
  )
}
