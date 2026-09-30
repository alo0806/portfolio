import PageHead from './PageHead'
import usePageTitle from './usePageTitle'
import './AboutPage.css'

const HOBBIES = [
  'Placeholder — long walks with a podcast',
  'Placeholder — games that are mostly atmosphere',
  'Placeholder — mechanical keyboards I do not need',
  'Placeholder — sketching interfaces on the bus',
]

const PHOTOS = [
  { fill: '--grad-1', tilt: '-3deg', caption: 'Placeholder one' },
  { fill: '--grad-4', tilt: '2deg', caption: 'Placeholder two' },
  { fill: '--grad-2', tilt: '-1.5deg', caption: 'Placeholder three' },
]

export default function AboutPage() {
  usePageTitle('About Me')

  return (
    <>
      <PageHead number="02" title="Hi, I’m Austin!" />
      <div className="about__prose">
        <p>
          Placeholder. I study cognitive science at UCLA, which mostly means I
          spend a lot of time thinking about why people do the thing they do
          instead of the thing the interface expected.
        </p>
        <p>
          Placeholder. I like the part of the work where a design stops being a
          picture and starts being something you can click — moving between
          Figma and the editor until the two agree.
        </p>
      </div>
      <section aria-labelledby="hobbies-title">
        <h2 className="mono panel-label about__label" id="hobbies-title">
          Off the clock
        </h2>
        <ul className="about__hobbies">
          {HOBBIES.map((hobby) => (
            <li key={hobby}>{hobby}</li>
          ))}
        </ul>
      </section>
      <ul className="about__photos" aria-label="Photos (placeholders)">
        {PHOTOS.map(({ fill, tilt, caption }) => (
          <li key={caption}>
            <figure className="photo" style={{ '--tilt': tilt }}>
              <div className="photo__image" style={{ background: `var(${fill})` }} />
              <figcaption className="mono photo__caption">{caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </>
  )
}
