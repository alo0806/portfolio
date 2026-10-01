import Reveal from '../components/Reveal'
import { about } from '../data/content'
import PageHead from './PageHead'
import usePageTitle from './usePageTitle'
import '../components/covers.css'
import './AboutPage.css'

export default function AboutPage() {
  usePageTitle('About Me')

  return (
    <>
      <PageHead path="/about" title={about.title} />
      <div className="about__prose">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Reveal as="section" aria-labelledby="hobbies-title">
        <h2 className="label about__label" id="hobbies-title">
          {about.hobbiesTitle}
        </h2>
        <ul className="about__hobbies">
          {about.hobbies.map((hobby) => (
            <li key={hobby}>{hobby}</li>
          ))}
        </ul>
      </Reveal>
      <ul className="about__photos" aria-label="Photos">
        {about.photos.map(({ image, alt, caption, palette, tilt }) => (
          <Reveal as="li" key={caption}>
            <figure className="photo" style={{ '--tilt': tilt }}>
              {image ? (
                <img
                  className="photo__image"
                  data-palette={palette}
                  src={image}
                  alt={alt}
                  width="800"
                  height="1000"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="photo__image" data-palette={palette} />
              )}
              <figcaption className="photo__caption">{caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </>
  )
}
