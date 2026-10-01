import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Ambient from '../components/Ambient'
import Clock from '../components/Clock'
import Record from '../components/Record'
import SoundToggle from '../components/SoundToggle'
import Tonearm from '../components/Tonearm'
import { PlayIcon } from '../components/icons'
import { useIris } from '../components/iris/irisContext'
import { usePlayer } from '../components/player/playerContext'
import { intro } from '../data/content'
import useReducedMotion from '../hooks/useReducedMotion'
import { clearEntranceCue, markIntroSeen } from '../lib/session'
import { readNumberToken } from '../lib/tokens'
import { SOUND } from '../sound/config'
import { roomCrackle, sound } from '../sound/engine'
import { getMusic } from '../sound/music'
import './IntroPage.css'
import useNameLetters from './useNameLetters'

const SCRATCHED_KEY = 'astnlo:scratched'

function readScratched() {
  try {
    return window.sessionStorage.getItem(SCRATCHED_KEY) === '1'
  } catch {
    return false
  }
}

/* Each word sits in its own clipped box and rises into view. The spaces
   stay real text, so the heading still reads as one line to assistive
   tech. The words of `name` are split into letters (data-letter, counted
   across the name) for useNameLetters; the letters are hidden from
   assistive tech, which reads the whole word from a hidden copy. */
function RevealWords({ text, name = '' }) {
  const words = text.split(' ')
  const nameWords = name.split(' ').filter(Boolean)
  const nameAt = words.findIndex((_, i) =>
    nameWords.every((word, j) => words[i + j] === word),
  )
  let letter = 0
  return words.map((word, i) => {
    const inName = nameWords.length > 0 && nameAt >= 0 && i >= nameAt && i < nameAt + nameWords.length
    return (
      <Fragment key={`${word}-${i}`}>
        <span className="reveal-word">
          <span className="reveal-word__inner" style={{ '--w': i }}>
            {inName ? (
              <>
                <span className="sr-only">{word}</span>
                {[...word].map((char, j) => (
                  <span key={j} className="intro__letter" data-letter={letter++} aria-hidden="true">
                    {char}
                  </span>
                ))}
              </>
            ) : (
              word
            )}
          </span>
        </span>
        {i < words.length - 1 ? ' ' : null}
      </Fragment>
    )
  })
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
   claimed on the first press and a second press is refused.

   Things to play with while you're here: the backdrop plays a note per
   click; the record can be grabbed and scratched; the letters of the
   name lift toward the cursor (and play their own notes). After the
   first interaction a quiet vinyl crackle fills the room — "press play"
   crossfades it into the music, "skip intro" fades it out. The speaker
   in the corner mutes all of it (the same switch as the player bar's). */
export default function IntroPage() {
  const { cover } = useIris()
  const { play: startPlaying } = usePlayer()
  const reduced = useReducedMotion()
  const location = useLocation()
  const [entry] = useState(() => (location.state?.entrance === 'return' ? 'return' : 'first'))
  const [phase, setPhase] = useState('idle') // idle → arm → crackle → spin
  const [leaving, setLeaving] = useState(false)
  const [leaveDelay, setLeaveDelay] = useState(0)
  const [scratched, setScratched] = useState(readScratched)
  const rootRef = useRef(null)
  const recordRef = useRef(null)
  const titleRef = useRef(null)
  const timersRef = useRef([])

  useNameLetters(titleRef, { reduced })

  // Seeing it once is the whole session's intro: a reload or a later
  // visit to "/" goes straight to /work (unless replayed on purpose).
  useEffect(() => {
    document.title = 'Austin Lo'
    markIntroSeen()
    clearEntranceCue()
    const timers = timersRef.current
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [])

  // The room crackle starts with the first interaction anywhere on the
  // intro, except the two buttons themselves (they leave straight away)
  // or while music is already playing (coming back from the site). It
  // fades out if the intro goes away any other way; after "press play"
  // it has already been handed off to the music.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const onFirst = (event) => {
      if (event.target instanceof Element && event.target.closest('.intro__actions')) return
      root.removeEventListener('pointerdown', onFirst, true)
      root.removeEventListener('keydown', onFirst, true)
      if (!getMusic().playing) roomCrackle.start()
    }
    root.addEventListener('pointerdown', onFirst, true)
    root.addEventListener('keydown', onFirst, true)
    return () => {
      root.removeEventListener('pointerdown', onFirst, true)
      root.removeEventListener('keydown', onFirst, true)
      roomCrackle.stop()
    }
  }, [])

  const onScratch = useCallback(() => {
    setScratched(true)
    try {
      window.sessionStorage.setItem(SCRATCHED_KEY, '1')
    } catch {
      // Not remembered; harmless.
    }
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

    // Sound follows the picture: the thump as the needle lands (the arm's
    // drop starts at 85% of its swing) and crackle through the spin-up.
    // The music (if there is any) waits until those have had the stage
    // (config: music.introDelay), then fades in. It has to be started
    // inside this click (browsers' autoplay rule); music.js keeps it silent
    // until then. "skip intro" never starts it.
    const needleAt = reduced ? 0 : (armMs * 0.85) / 1000
    startPlaying({ delay: SOUND.music.introDelay, fadeIn: SOUND.music.introFade })
    roomCrackle.handOff({ at: SOUND.music.introDelay, over: SOUND.music.introFade })
    if (reduced) {
      sound.needleDrop()
      return
    }
    sound.needleDrop({ delay: needleAt })
    sound.crackle({ delay: armMs / 1000, duration: (leadIn - armMs) / 1000 + 0.35 })

    setPhase('arm')
    timersRef.current.push(
      window.setTimeout(() => setPhase('crackle'), armMs),
      window.setTimeout(() => setPhase('spin'), spinAt),
    )
  }

  const skip = (event) => {
    event.preventDefault()
    if (leaving) return
    if (!cover({ to: '/work' })) return
    setLeaving(true)
    roomCrackle.stop()
  }

  return (
    <div
      ref={rootRef}
      className="intro"
      data-surface="dark"
      data-entry={entry}
      data-leaving={leaving ? 'true' : 'false'}
      style={{ '--leave-delay': `${leaveDelay}ms` }}
    >
      <Ambient className="intro__ambient" interactive onPress={sound.tap} />

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
              scratchable={!leaving}
              onScratch={onScratch}
            />
            <Tonearm state={phase === 'idle' ? 'rest' : 'play'} />
            <p className="intro__hint" data-hidden={scratched ? 'true' : 'false'} aria-hidden="true">
              <span className="intro__hint-text">{intro.hint}</span>
            </p>
          </div>
        </div>

        <div className="intro__words">
          <h1 className="intro__title" ref={titleRef}>
            <RevealWords text={intro.greeting} name={intro.name} />
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
      <SoundToggle className="intro__sound" />
    </div>
  )
}
