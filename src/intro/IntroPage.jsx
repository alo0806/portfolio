import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Ambient from '../components/Ambient'
import Clock from '../components/Clock'
import Record from '../components/Record'
import Tonearm from '../components/Tonearm'
import { PlayIcon } from '../components/icons'
import { useIris } from '../components/iris/irisContext'
import { intro } from '../data/content'
import useReducedMotion from '../hooks/useReducedMotion'
import { clearEntranceCue, markIntroSeen } from '../lib/session'
import { readNumberToken } from '../lib/tokens'
import './IntroPage.css'

/* Each word sits in its own clipped box and rises into view. The spaces
   stay real text, so the heading still reads as one line to assistive
   tech. */
function RevealWords({ text }) {
  const words = text.split(' ')
  return words.map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="reveal-word">
        <span className="reveal-word__inner" style={{ '--w': i }}>
          {word}
        </span>
      </span>
      {i < words.length - 1 ? ' ' : null}
    </Fragment>
  ))
}

/* The listening room.

   Entrance: the record fades up and turns into place, the particles
   drift in, the greeting rises word by word, then the small line and the
   buttons settle. Coming back from the site ("return"), the page has just
   contracted onto the record: the record spins down from full speed and
   the words come back instead.

   "press play": tonearm swings on → needle drops → a flicker of vinyl
   crackle → the record spins up → the iris opens from its centre. The
   whole lead-in is handed to cover() as a delay, so the transition is
   claimed on the first press and a second press is refused. */
export default function IntroPage() {
  const { cover } = useIris()
  const reduced = useReducedMotion()
  const location = useLocation()
  const [entry] = useState(() => (location.state?.entrance === 'return' ? 'return' : 'first'))
  const [phase, setPhase] = useState('idle') // idle → arm → crackle → spin
  const [leaving, setLeaving] = useState(false)
  const [leaveDelay, setLeaveDelay] = useState(0)
  const recordRef = useRef(null)
  const timersRef = useRef([])

  // Seeing it once is the whole session's intro: a reload or a later
  // visit to "/" goes straight to /work (unless replayed on purpose).
  useEffect(() => {
    document.title = 'Austin Lo'
    markIntroSeen()
    clearEntranceCue()
    const timers = timersRef.current
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [])

  const play = (event) => {
    event.preventDefault()
    if (leaving) return

    const armMs = readNumberToken('--tonearm-ms', 420)
    const crackleMs = readNumberToken('--crackle-ms', 220)
    const spinMs = readNumberToken('--spinup-ms', 400)
    const spinAt = armMs + crackleMs * 0.5
    const leadIn = reduced ? 0 : spinAt + spinMs

    const rect = recordRef.current.getBoundingClientRect()
    const started = cover({
      to: '/work',
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      delay: leadIn,
    })
    if (!started) return

    setLeaving(true)
    setLeaveDelay(leadIn)
    if (reduced) return

    setPhase('arm')
    timersRef.current.push(
      window.setTimeout(() => setPhase('crackle'), armMs),
      window.setTimeout(() => setPhase('spin'), spinAt),
    )
  }

  const skip = (event) => {
    event.preventDefault()
    if (leaving) return
    if (cover({ to: '/work' })) setLeaving(true)
  }

  return (
    <div
      className="intro"
      data-surface="dark"
      data-entry={entry}
      data-leaving={leaving ? 'true' : 'false'}
      style={{ '--leave-delay': `${leaveDelay}ms` }}
    >
      <Ambient className="intro__ambient" interactive />

      <main id="main" className="intro__stage" data-rm-fade="">
        <div className="intro__deck">
          <div className="intro__deck-in" data-iris-target="">
            <Record
              ref={recordRef}
              className="intro__record"
              label={intro.recordLabel}
              fast={phase === 'spin'}
              startFast={entry === 'return'}
              crackle={phase === 'crackle' || phase === 'spin'}
            />
            <Tonearm state={phase === 'idle' ? 'rest' : 'play'} />
          </div>
        </div>

        <div className="intro__words">
          <h1 className="intro__title">
            <RevealWords text={intro.greeting} />
          </h1>
          <p className="intro__aka">{intro.aka}</p>
        </div>

        <div className="intro__actions">
          <Link to="/work" className="intro__play" onClick={play}>
            <span className="intro__play-icon">
              <PlayIcon width={16} height={16} />
            </span>
            {intro.play}
          </Link>
          <Link to="/work" className="intro__skip u-line" onClick={skip}>
            {intro.skip}
          </Link>
        </div>
      </main>

      <Clock className="intro__clock" />
    </div>
  )
}
