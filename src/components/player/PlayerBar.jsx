import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { nowPlaying } from '../../data/content'
import { TRACKS, trackIndexFor } from '../../data/tracks'
import { stepTrack } from '../../lib/trackNav'
import { sound } from '../../sound/engine'
import { skip as skipSong, useMusic } from '../../sound/music'
import Equalizer from '../Equalizer'
import Mascot from '../Mascot'
import SoundToggle from '../SoundToggle'
import VolumeSlider from '../VolumeSlider'
import { NextIcon, PrevIcon, SkipSongIcon } from '../icons'
import SeekBar from './SeekBar'
import { usePlayer } from './playerContext'
import '../covers.css'
import './PlayerBar.css'

const MARQUEE_SPEED = 38 // px per second

/* Pinned to the bottom of the main area.
   - prev / next step through the tracklist (wrapping at either end), via
     the shared track navigator so direction and rapid presses agree with
     the tracklist
   - play / pause starts and stops the music and the site's ambient
     motion together; its icon morphs between the two shapes
   - "Now playing" is the real song (from the playlist), with its credit
     link when the license asks for one, and a small "next song" button
     when there's more than one; a title too long for its space scrolls
   - the cover square flips to each new page (track) and turns slowly
     while playing
   - the bar under the controls is the song: elapsed / length, seekable
   - the hairline along the top edge shows how far you've scrolled
     through this page */
export default function PlayerBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { playing, toggle } = usePlayer()
  const music = useMusic()
  const fillRef = useRef(null)
  const marqueeRef = useRef(null)

  const count = TRACKS.length
  const index = Math.max(0, trackIndexFor(pathname))
  const track = TRACKS[index]
  const prev = TRACKS[(index - 1 + count) % count]
  const next = TRACKS[(index + 1) % count]
  const song = music.song
  const title = song ? `${song.title} — ${song.artist}` : `${nowPlaying.song} — ${nowPlaying.artist}`
  const what = music.available ? 'music' : 'ambient motion' 

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
      {/* How far you've scrolled through this page. */}
      <span className="player__scroll" aria-hidden="true">
        <span className="player__scroll-fill" ref={fillRef} />
      </span>

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
          <span className="player__label">
            <Equalizer className="player__eq" />
            Now playing
            {song?.credit && song.creditUrl ? (
              <>
                <span aria-hidden="true"> · </span>
                <a className="player__credit" href={song.creditUrl} target="_blank" rel="noreferrer">
                  {song.credit}
                  <span className="sr-only"> (license, opens in a new tab)</span>
                </a>
              </>
            ) : null}
          </span>
          <span className="player__song marquee" ref={marqueeRef} data-overflow="false">
            <span className="marquee__track">
              <span className="marquee__text">{title}</span>
              <span className="marquee__text marquee__copy" aria-hidden="true">
                {title}
              </span>
            </span>
          </span>
        </p>
        {music.next ? (
          <button
            type="button"
            className="player__btn player__btn--song"
            aria-label={`Next song: ${music.next.title}`}
            title="Next song"
            onClick={() => {
              sound.click()
              skipSong()
            }}
          >
            <SkipSongIcon width={16} height={16} />
          </button>
        ) : null}
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
            aria-label={playing ? `Pause ${what}` : `Play ${what}`}
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
        {music.available ? <SeekBar time={music.time} duration={music.duration} /> : null}
      </div>

      <div className="player__side">
        <div className="player__volume">
          <SoundToggle />
          <VolumeSlider />
        </div>
        <Mascot size={52} align="end" />
      </div>
    </section>
  )
}
