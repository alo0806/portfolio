import Section from './Section'
import Stage from './Stage'
import ProjectCard from './ProjectCard'
import './Projects.css'

const PROJECTS = [
  {
    numeral: 'I',
    title: 'Snippet Vault',
    kind: 'Web app',
    emblem: 'circle',
    blurb:
      'Placeholder. A keyboard-first place to keep the bits of code you keep rewriting, with search that actually finds them.',
    tags: ['React', 'Design system', 'Local-first'],
  },
  {
    numeral: 'II',
    title: 'Icon Hunter',
    kind: 'Tool',
    emblem: 'triangle',
    blurb:
      'Placeholder. Search across icon sets at once, compare weights side by side, and copy the SVG without leaving the page.',
    tags: ['React', 'Figma plugin', 'Search'],
  },
  {
    numeral: 'III',
    title: 'InnoDesign redesign concept',
    kind: 'Case study',
    emblem: 'crescent',
    status: 'In progress',
    blurb:
      'Placeholder. A self-directed rework of a site I use often — auditing the flows first, then rebuilding the pieces worth keeping.',
    tags: ['Product design', 'Research'],
  },
]

export default function Projects() {
  return (
    <Section id="projects" labelledBy="projects-title">
      <div className="shell chapter">
        <div>
          <p className="eyebrow">Chapter one · Work</p>
          <h2 className="section__title" id="projects-title">
            Things I&rsquo;ve been making.
          </h2>
          <ol className="projects">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </ol>
        </div>
        <Stage variant="projects" />
      </div>
    </Section>
  )
}
