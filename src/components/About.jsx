import Section from './Section'
import Stage from './Stage'

export default function About() {
  return (
    <Section id="about" labelledBy="about-title">
      <div className="shell chapter">
        <div>
          <p className="eyebrow">Chapter two · About</p>
          <h2 className="section__title" id="about-title">
            Hi, I&rsquo;m Austin.
          </h2>
          <div className="prose">
            <p>
              Placeholder. I study cognitive science at UCLA, which mostly means
              I spend a lot of time thinking about why people do the thing they
              do instead of the thing the interface expected.
            </p>
            <p>
              Placeholder. I like the part of the work where a design stops
              being a picture and starts being something you can click. Usually
              that means moving between Figma and the editor until the two
              agree.
            </p>
            <p>
              Placeholder. Outside of that: long walks with a podcast,
              mechanical keyboards I do not need, and games that are mostly
              about atmosphere.
            </p>
          </div>
        </div>
        <Stage variant="about" />
      </div>
    </Section>
  )
}
