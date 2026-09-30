import Reveal from '../components/Reveal'
import { projects, work } from '../data/content'
import AlbumCard from './AlbumCard'
import LinerNotes from './LinerNotes'
import PageHead from './PageHead'
import usePageTitle from './usePageTitle'
import './WorkPage.css'

export default function WorkPage() {
  usePageTitle(work.title)

  return (
    <>
      <PageHead path="/work" title={work.title} />
      <LinerNotes />
      <section aria-labelledby="projects-title">
        <h2 className="sr-only" id="projects-title">
          Projects
        </h2>
        <ul className="albums">
          {projects.map((project, index) => (
            <Reveal as="li" key={project.title}>
              <AlbumCard number={index + 1} {...project} />
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  )
}
