import Section from './Section'
import './Hero.css'

export default function Hero() {
  return (
    <Section id="hero" labelledBy="hero-title" className="hero">
      <div className="shell hero__shell">
        <p className="eyebrow">Design engineer</p>
        <h1 className="hero__title" id="hero-title">
          I design and build things on the web.
        </h1>
        <p className="hero__lead">
          Cog sci brain, front-end hands. I study cognitive science at UCLA,
          design in Figma, and build the thing myself in React.
        </p>
        <p className="hero__note">
          Currently looking for a summer 2027 internship.
        </p>
      </div>
    </Section>
  )
}
