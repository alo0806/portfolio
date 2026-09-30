import LatestLog from './LatestLog'
import PageHead from './PageHead'
import ProjectCard from './ProjectCard'
import usePageTitle from './usePageTitle'
import './WorkPage.css'

const METRICS = [
  { label: 'Metric one', value: '—' },
  { label: 'Metric two', value: '—' },
  { label: 'Metric three', value: '—' },
]

const PROJECTS = [
  {
    title: 'Project One',
    tag: 'Side project',
    fill: '--grad-1',
    description: 'Placeholder. One line about what it does and who it is for.',
    metrics: METRICS,
  },
  {
    title: 'Project Two',
    tag: 'Internship',
    fill: '--grad-2',
    description: 'Placeholder. One line about the problem and what changed.',
    metrics: METRICS,
  },
  {
    title: 'InnoDesign redesign (in progress)',
    tag: 'Side project',
    fill: '--grad-3',
    description: 'Placeholder. A self-directed rework, audited before redrawn.',
    metrics: METRICS,
  },
]

export default function WorkPage() {
  usePageTitle('My Work')

  return (
    <>
      <PageHead number="01" title="My Work" />
      <LatestLog />
      <section aria-labelledby="projects-title">
        <h2 className="sr-only" id="projects-title">
          Projects
        </h2>
        <ul className="work-grid">
          {PROJECTS.map((project) => (
            <li key={project.title}>
              <ProjectCard {...project} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
