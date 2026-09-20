import Section from './Section'
import ProjectCard from './ProjectCard'
import './Projects.css'

const PROJECTS = [
  {
    index: 1,
    title: 'Snippet Vault',
    blurb:
      'Placeholder. A keyboard-first place to keep the bits of code you keep rewriting, with search that actually finds them.',
    tags: ['React', 'Design system', 'Local-first'],
  },
  {
    index: 2,
    title: 'Icon Hunter',
    blurb:
      'Placeholder. Search across icon sets at once, compare weights side by side, and copy the SVG without leaving the page.',
    tags: ['React', 'Figma plugin', 'Search'],
  },
  {
    index: 3,
    title: 'InnoDesign redesign concept',
    blurb:
      'Placeholder. A self-directed rework of a site I use often — auditing the flows first, then rebuilding the pieces worth keeping.',
    tags: ['Product design', 'Case study'],
    status: 'In progress',
  },
]

export default function Projects() {
  return (
    <Section id="projects" labelledBy="projects-title">
      <div className="shell">
        <p className="eyebrow">Selected work</p>
        <h2 className="section__title" id="projects-title">
          Things I&rsquo;ve been making.
        </h2>
        <ul className="projects__grid">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </ul>
      </div>
    </Section>
  )
}
