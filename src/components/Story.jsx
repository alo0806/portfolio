import Section from './Section'
import Stage from './Stage'
import './Story.css'

const TIMELINE = [
  {
    when: 'Now',
    what: 'Placeholder. Studying cognitive science at UCLA and building small tools to learn the front end properly.',
  },
  {
    when: 'Next',
    what: 'Placeholder. A design engineering internship for summer 2027, somewhere design and code share a room.',
  },
  {
    when: 'Later',
    what: 'Placeholder. Interfaces that feel considered from the first pixel to the last line of CSS.',
  },
]

export default function Story() {
  return (
    <Section id="story" labelledBy="story-title">
      <div className="shell chapter">
        <div>
          <p className="eyebrow">Chapter three · Story</p>
          <h2 className="section__title" id="story-title">
            Where this is going.
          </h2>
          <ol className="story">
            {TIMELINE.map(({ when, what }) => (
              <li key={when} className="story__item">
                <p className="ui-label story__when">{when}</p>
                <p className="story__what">{what}</p>
              </li>
            ))}
          </ol>
        </div>
        <Stage variant="story" />
      </div>
    </Section>
  )
}
