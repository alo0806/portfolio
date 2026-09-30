import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Clock from '../components/Clock'
import Starfield from '../components/Starfield'
import { useIris } from '../components/iris/irisContext'
import { markIntroSeen } from '../lib/session'
import './IntroPage.css'

const SPARKLE = 'M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z'

/* Dark sky, the name, and a way in. "step inside" opens an iris from the
   button itself; "skip intro" fades straight through. Both are real links
   to /work, so they work (and read correctly) without the animation. */
export default function IntroPage() {
  const { cover } = useIris()
  const [leaving, setLeaving] = useState(false)
  const enterRef = useRef(null)

  // Seeing it once is the whole session's intro: a reload or a later
  // visit to "/" goes straight to /work (unless replayed on purpose).
  useEffect(() => {
    document.title = 'Austin Lo'
    markIntroSeen()
  }, [])

  const enter = (event) => {
    event.preventDefault()
    if (leaving) return
    const rect = enterRef.current.getBoundingClientRect()
    const started = cover({
      to: '/work',
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    })
    if (started) setLeaving(true)
  }

  const skip = (event) => {
    event.preventDefault()
    if (leaving) return
    if (cover({ to: '/work' })) setLeaving(true)
  }

  return (
    <div className="intro" data-surface="dark" data-leaving={leaving ? 'true' : 'false'}>
      <Starfield className="intro__sky" interactive />

      <main id="main" className="intro__stage">
        <p className="mono intro__hi">Hi, I&rsquo;m</p>
        <h1 className="intro__name">Austin Lo</h1>
        <p className="mono intro__aka">(some people call me alo)</p>

        <div className="intro__actions">
          <Link to="/work" ref={enterRef} className="mono intro__enter" onClick={enter}>
            <span className="intro__enter-label">step inside</span>
            <svg className="intro__spark intro__spark--a" viewBox="0 0 12 12" aria-hidden="true">
              <path d={SPARKLE} />
            </svg>
            <svg className="intro__spark intro__spark--b" viewBox="0 0 12 12" aria-hidden="true">
              <path d={SPARKLE} />
            </svg>
          </Link>
          <Link to="/work" className="mono intro__skip" onClick={skip}>
            skip intro
          </Link>
        </div>
      </main>

      <Clock className="intro__clock" />
    </div>
  )
}
