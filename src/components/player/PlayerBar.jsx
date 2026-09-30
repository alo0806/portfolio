import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { nowPlaying } from '../../data/content'
import { TRACKS, trackIndexFor } from '../../data/tracks'
import { stepTrack } from '../../lib/trackNav'
import { sound } from '../../sound/engine'
import Mascot from '../Mascot'
import SoundToggle from '../SoundToggle'
import { NextIcon, PrevIcon } from '../icons'
import { usePlayer } from './playerContext'
import '../covers.css'
import './PlayerBar.css'

const MARQUEE_SPEED = 38 // px per second

/* Pinned to the bottom of the main area.
   - prev / next step through the tracklist (wrapping at either end), via
     the shared track navigator so direction and rapid presses agree with
     the tracklist
   - play / pause turns the site's ambient motion on and off; its icon
     morphs between the two shapes
   - the cover square flips to each new track and turns slowly while
     playing; a title too long for its space scrolls as a marquee
   - the orange bar under the controls shows how far you've scrolled
     through this page (the clock lives in the artist panel) */
export default function PlayerBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { playing, toggle } = usePlayer()
  const fillRef = useRef(null)
  const marqueeRef = useRef(null)

  const count = TRACKS.length
  const index = Math.max(0, trackIndexFor(pathname))
  const track = TRACKS[index]
  const prev = TRACKS[(index - 1 + count) % count]
  const next = TRACKS[(index + 1) % count]
  const title = `${nowPlaying.song} — ${nowPlaying.artist}`

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
    const settle = window.setTimeout(measure, 450)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [pathname])

  // Marquee only when the title actually overflows its space.
  useEffect(() => {
    const box = marqueeRef.current
    if (!box) return undefined
    const text = box.querySelector('.marquee__text')

    const check = () => {
      // Rendered width, not scrollWidth: the text is an inline span, and
      // an inline element's scrollWidth is always 0.
      // Minus the gap padding a running marquee adds, so it switches off
      // again if the space grows back.
      const width =
        text.getBoundingClientRect().width -
        parseFloat(getComputedStyle(text).paddingRight || '0')
      box.dataset.overflow = width > box.clientWidth + 1 ? 'true' : 'false'
      box.style.setProperty(
        '--marquee-dur',
        `${Math.max(6, width / MARQUEE_SPEED).toFixed(1)}s`,
      )
    }

    const observer = new ResizeObserver(check)
    observer.observe(box)
    check()
    return () => observer.disconnect()
  }, [title])

  return (
    <section className="player" aria-label="Player" data-rm-fade="">

      <div className="player__now">
        <span
          className="player__cover"
          key={track.path}
          data-palette={track.cover}
          aria-hidden="true"
        >
          <span className="player__cover-art">{track.number}</span>
        </span>
        <p className="player__meta">
          <span className="player__label">Now playing</span>
          <span className="player__song marquee" ref={marqueeRef} data-overflow="false">
            <span className="marquee__track">
              <span className="marquee__text">{title}</span>
              <span className="marquee__text marquee__copy" aria-hidden="true">
                {title}
              </span>
            </span>
          </span>
        </p>
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button
            type="button"
            className="player__btn player__btn--prev"
            aria-label={`Previous track: ${prev.title}`}
            onClick={() => {
              const target = stepTrack(navigate, pathname, -1)
              sound.switchTrack(target.number - 1)
            }}
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            className="player__btn player__btn--play"
            aria-label={playing ? 'Pause ambient motion' : 'Play ambient motion'}
            onClick={() => {
              sound.click()
              toggle()
            }}
          >
            <span className="pp" data-state={playing ? 'playing' : 'paused'} aria-hidden="true">
              <span className="pp__half pp__half--l" />
              <span className="pp__half pp__half--r" />
            </span>
          </button>
          <button
            type="button"
            className="player__btn player__btn--next"
            aria-label={`Next track: ${next.title}`}
            onClick={() => {
              const target = stepTrack(navigate, pathname, 1)
              sound.switchTrack(target.number - 1)
            }}
          >
            <NextIcon />
          </button>
        </div>
        {/* How far you've scrolled through this page. */}
          <span className="player__progress" aria-hidden="true">
            <span className="player__fill" ref={fillRef} />
          </span>
        </div>

      <div className="player__side">
        <SoundToggle />
        <Mascot size={52} align="end" />
      </div>
    </section>
  )
}
