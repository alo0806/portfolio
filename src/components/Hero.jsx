import Section from './Section'
import Stage from './Stage'
import './Hero.css'

export default function Hero() {
  return (
    <Section id="hero" labelledBy="hero-title" className="hero" wash={false}>
      <div className="shell chapter hero__chapter">
        <div className="hero__content">
          <p className="eyebrow">Design engineer</p>
          <h1 className="hero__title" id="hero-title">
            I design and build things on the web.
          </h1>
          <p className="hero__lead">
            Cog sci brain, front-end hands. I study cognitive science at UCLA,
            design in Figma, and build the thing myself in React.
          </p>
          <p className="ui-label hero__note">
            Looking for a summer 2027 internship
          </p>
        </div>
        <Stage variant="hero" hero />
      </div>
    </Section>
  )
}
