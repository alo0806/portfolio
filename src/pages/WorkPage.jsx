import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Reveal from '../components/Reveal'
import Lightbox from '../components/work/Lightbox'
import { projects, work, workSections } from '../data/content'
import { duration, ease, prefersReducedMotion } from '../lib/motion'
import { sound } from '../sound/engine'
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

/* My Work: the liner notes, a row of buttons that jump to each section,
   then each section of content.js's workSections that has projects —
   Singles (album cards that open a case study), then the rest (cards
   that open the gallery). Early work starts collapsed behind a toggle
   (jumping to it opens it). Card numbers run on across the page. */
export default function WorkPage() {
  usePageTitle(work.title)
  const [gallery, setGallery] = useState(null) // { project, card, button }
  const [opened, setOpened] = useState({}) // collapsible sections the visitor opened

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
      <SectionJump sections={sections} onOpenSection={(id) => setOpened((o) => ({ ...o, [id]: true }))} />
      {sections.map((section) => (
        <WorkSection
          key={section.id}
          section={section}
          numbered={numbered}
          onOpen={open}
          expanded={!section.toggle || Boolean(opened[section.id])}
          onToggle={(value) => setOpened((o) => ({ ...o, [section.id]: value }))}
        />
      ))}
      {gallery ? (
        <Lightbox project={gallery.project} card={gallery.card} returnTo={gallery.button} onClosed={closed} />
      ) : null}
    </>
  )
}

/* Opening a collapsed section: its cards rise in, one after another. */
function riseIn(grid) {
  if (prefersReducedMotion()) return
  requestAnimationFrame(() => {
    grid?.querySelectorAll(':scope > li').forEach((item, i) => {
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

/* A row of buttons under the liner notes, one per section shown (with its
   number of projects), that scroll to it — smoothly, unless reduced
   motion is on — and move focus to its title, so keyboard and screen
   reader users land there too. A collapsed section is opened first. */
function SectionJump({ sections, onOpenSection }) {
  if (sections.length < 2) return null

  const jump = (event, section) => {
    event.preventDefault()
    sound.click()
    if (section.toggle) onOpenSection(section.id)
    // After React has opened it (if it was collapsed), so it scrolls to
    // where the section really ends up.
    requestAnimationFrame(() => {
      const target = document.getElementById(`section-${section.id}`)
      if (!target) return
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
      target.querySelector('.work-section__title')?.focus({ preventScroll: true })
    })
  }

  return (
    <nav className="work-jump" aria-label="Sections">
      <ul className="work-jump__list">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className="work-jump__chip"
              href={`#section-${section.id}`}
              onClick={(event) => jump(event, section)}
            >
              {section.title}
              <span className="work-jump__count num">
                {section.items.length}
                <span className="sr-only"> projects</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function WorkSection({ section, numbered, onOpen, expanded, onToggle }) {
  const titleId = useId()
  const gridId = useId()
  const gridRef = useRef(null)
  const wasExpanded = useRef(expanded)
  const layout = LAYOUT[section.id] ?? LAYOUT.deepcuts

  // Opened (by its toggle or a jump): the cards rise in.
  useEffect(() => {
    if (expanded && !wasExpanded.current) riseIn(gridRef.current)
    wasExpanded.current = expanded
  }, [expanded])

  const toggle = () => onToggle(!expanded)

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
    <section
      className="work-section"
      id={`section-${section.id}`}
      aria-labelledby={titleId}
      data-section={section.id}
    >
      <header className="work-section__head">
        <h2 className="work-section__title" id={titleId} tabIndex={-1}>
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
