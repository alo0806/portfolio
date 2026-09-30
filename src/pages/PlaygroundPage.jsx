import Starfield from '../components/Starfield'
import PageHead from './PageHead'
import usePageTitle from './usePageTitle'
import './PlaygroundPage.css'

const SPARKLE = 'M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z'

export default function PlaygroundPage() {
  usePageTitle('Playground')

  return (
    <>
      <PageHead number="03" title="Playground" />
      <p className="playground__lead">
        Placeholder. Small experiments, toys, and things that don’t fit
        anywhere else.
      </p>
      <section className="playground__panel" data-surface="dark" aria-label="Playground preview">
        <Starfield density={1.4} maxStars={110} sparkleRatio={0.08} interactive />
        {['a', 'b', 'c'].map((key) => (
          <svg key={key} className={`playground__spark playground__spark--${key}`} viewBox="0 0 12 12" aria-hidden="true">
            <path d={SPARKLE} />
          </svg>
        ))}
        <p className="mono playground__pill">Coming soon</p>
      </section>
    </>
  )
}
