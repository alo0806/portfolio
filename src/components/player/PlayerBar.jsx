import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { nowPlaying } from '../../data/content'
import { TRACKS, trackIndexFor } from '../../data/tracks'
import Clock from '../Clock'
import Mascot from '../Mascot'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from '../icons'
import { usePlayer } from './playerContext'
import '../covers.css'
import './PlayerBar.css'

/* Pinned to the bottom of the main area.
   - prev / next step through the tracklist (wrapping at either end)
   - play / pause turns the site's ambient motion on and off
   - the progress bar is how far you've scrolled through this page,
     with the local time as its readout */
export default function PlayerBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { playing, toggle } = usePlayer()
  const fillRef = useRef(null)
  // The last track we asked for. A page switch takes a frame or two to
  // land (view transition), and rapid prev/next presses must step from
  // where we're heading, not from the page still on screen.
  const headingToRef = useRef(null)
  const headingTimerRef = useRef(0)

  const count = TRACKS.length
  const index = Math.max(0, trackIndexFor(pathname))
  const track = TRACKS[index]
  const prev = TRACKS[(index - 1 + count) % count]
  const next = TRACKS[(index + 1) % count]

  useEffect(() => {
    if (headingToRef.current === pathname) headingToRef.current = null
  }, [pathname])

  useEffect(() => () => window.clearTimeout(headingTimerRef.current), [])

  const step = (direction) => {
    const from = trackIndexFor(headingToRef.current ?? pathname)
    const target = TRACKS[(Math.max(0, from) + direction + count) % count]
    headingToRef.current = target.path
    // If something else navigates meanwhile (a tracklist click), the
    // pending target mustn't outlive the switch it was waiting for.
    window.clearTimeout(headingTimerRef.current)
    headingTimerRef.current = window.setTimeout(() => {
      headingToRef.current = null
    }, 1200)
    navigate(target.path, { viewTransition: true })
  }

  // Scroll progress, written straight to a transform: no re-renders.
  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return undefined
    let frame = 0

    const measure = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 1 ? Math.min(1, window.scrollY / scrollable) : 1
      fill.style.transform = `scaleX(${progress.toFixed(4)})`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Page content settles in after the switch; measure again then.
    const settle = window.setTimeout(measure, 450)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [pathname])

  return (
    <section className="player" aria-label="Player">
      <div className="player__now">
        <span className="player__cover" data-palette={track.cover} aria-hidden="true">
          {track.number}
        </span>
        <p className="player__meta">
          <span className="player__label">Now playing</span>
          <span className="player__song">
            {nowPlaying.song} <span className="player__dash">—</span> {nowPlaying.artist}
          </span>
        </p>
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button
            type="button"
            className="player__btn player__btn--prev"
            aria-label={`Previous track: ${prev.title}`}
            onClick={() => step(-1)}
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            className="player__btn player__btn--play"
            aria-label={playing ? 'Pause ambient motion' : 'Play ambient motion'}
            onClick={toggle}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            className="player__btn player__btn--next"
            aria-label={`Next track: ${next.title}`}
            onClick={() => step(1)}
          >
            <NextIcon />
          </button>
        </div>
        <div className="player__progress">
          <span className="player__bar" aria-hidden="true">
            <span className="player__fill" ref={fillRef} />
          </span>
          <Clock className="player__time" format="compact" />
        </div>
      </div>

      <div className="player__side">
        <Mascot size={52} align="end" />
      </div>
    </section>
  )
}
