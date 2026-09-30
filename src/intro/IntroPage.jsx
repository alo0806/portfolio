import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Ambient from '../components/Ambient'
import Clock from '../components/Clock'
import Record from '../components/Record'
import { PlayIcon } from '../components/icons'
import { useIris } from '../components/iris/irisContext'
import { intro } from '../data/content'
import useReducedMotion from '../hooks/useReducedMotion'
import { markIntroSeen } from '../lib/session'
import { readNumberToken } from '../lib/tokens'
import './IntroPage.css'

/* The listening room: a record turning slowly, a few particles and
   waveform lines drifting, and a way in. "press play" spins the record
   up, then opens the iris from the record's centre. "skip intro" fades
   straight through. Both are real links to /work. */
export default function IntroPage() {
  const { cover } = useIris()
  const reduced = useReducedMotion()
  const [leaving, setLeaving] = useState(false)
  const [spinningUp, setSpinningUp] = useState(false)
  const recordRef = useRef(null)

  // Seeing it once is the whole session's intro: a reload or a later
  // visit to "/" goes straight to /work (unless replayed on purpose).
  useEffect(() => {
    document.title = 'Austin Lo'
    markIntroSeen()
  }, [])

  const play = (event) => {
    event.preventDefault()
    if (leaving) return
    const rect = recordRef.current.getBoundingClientRect()
    const started = cover({
      to: '/work',
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      delay: reduced ? 0 : readNumberToken('--spinup-ms', 400),
    })
    if (!started) return
    setSpinningUp(true)
    setLeaving(true)
  }

  const skip = (event) => {
    event.preventDefault()
    if (leaving) return
    if (cover({ to: '/work' })) setLeaving(true)
  }

  return (
    <div className="intro" data-surface="dark" data-leaving={leaving ? 'true' : 'false'}>
      <Ambient className="intro__ambient" interactive />

      <main id="main" className="intro__stage">
        <Record ref={recordRef} className="intro__record" label={intro.recordLabel} fast={spinningUp} />

        <div className="intro__words">
          <h1 className="intro__title">{intro.greeting}</h1>
          <p className="intro__aka">{intro.aka}</p>
        </div>

        <div className="intro__actions">
          <Link to="/work" className="intro__play" onClick={play}>
            <span className="intro__play-icon">
              <PlayIcon width={16} height={16} />
            </span>
            {intro.play}
          </Link>
          <Link to="/work" className="intro__skip" onClick={skip}>
            {intro.skip}
          </Link>
        </div>
      </main>

      <Clock className="intro__clock" />
    </div>
  )
}
