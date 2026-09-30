import Reveal from '../components/Reveal'
import Waveform from '../components/Waveform'
import { playground } from '../data/content'
import PageHead from './PageHead'
import usePageTitle from './usePageTitle'
import './PlaygroundPage.css'

export default function PlaygroundPage() {
  usePageTitle(playground.title)

  return (
    <>
      <PageHead path="/playground" title={playground.title} />
      <p className="bsides__lead">{playground.lead}</p>
      <Reveal
        as="section"
        className="bsides__panel"
        data-surface="dark"
        aria-label={`${playground.title} preview`}
      >
        <Waveform className="bsides__wave" />
        <p className="bsides__pill">{playground.status}</p>
      </Reveal>
    </>
  )
}
