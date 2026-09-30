import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { nowPlaying } from '../../data/content'
import { TRACKS, trackIndexFor } from '../../data/tracks'
import { stepTrack } from '../../lib/trackNav'
import { sound } from '../../sound/engine'
import { skip as skipSong, useMusic } from '../../sound/music'
import Mascot from '../Mascot'
import SoundToggle from '../SoundToggle'
import VolumeSlider from '../VolumeSlider'
import { MusicNextIcon, NextIcon, PrevIcon } from '../icons'
import QueuePopover from './QueuePopover'
import SeekBar from './SeekBar'
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
     through this page (the clock lives in the artist panel)
   With songs in the playlist (content.js): "Now playing" is the real
   song, with its credit link when the license asks for one and a small
   "next song" button when there's more than one; the cover square shows
   the song (and flips when it changes); the cover + title open the song
   queue; play / pause also starts and stops the music; and the orange
   bar shows the song instead of the scroll, and can be clicked, dragged
   or keyed to seek. */

// Songs have no artwork: each gets a palette (cycling) and its number.
const SONG_PALETTES = ['sunset', 'plum', 'mint', 'citrus']
export default function PlayerBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { playing, musicOn, toggle } = usePlayer()
  const music = useMusic()
  const queueId = useId()
  const queueButtonRef = useRef(null)
  const [queueOpen, setQueueOpen] = useState(false)
  const closeQueue = useCallback((returnFocus) => {
    setQueueOpen(false)
    if (returnFocus) queueButtonRef.current?.focus()
  }, [])
  const fillRef = useRef(null)
  const marqueeRef = useRef(null)

  const count = TRACKS.length
  const index = Math.max(0, trackIndexFor(pathname))
  const track = TRACKS[index]
  const prev = TRACKS[(index - 1 + count) % count]
  const next = TRACKS[(index + 1) % count]
  const song = music.song
  const title = song ? `${song.title} — ${song.artist}` : `${nowPlaying.song} — ${nowPlaying.artist}`
  // With music, the button (and its icon) follow the music; without, the motion.
  const active = music.available ? musicOn : playing
  const what = music.available ? 'music' : 'ambient motion'

  // Scroll progress, written straight to a transform: no re-renders.
  // (With music, the bar shows the song instead.)
  useEffect(() => {
    if (music.available) return undefined
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
  }, [pathname, music.available])

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

  // The cover square: the song while there's music, else the page.
  const cover = song
    ? { key: `song-${music.index}`, palette: SONG_PALETTES[music.index % SONG_PALETTES.length], label: music.index + 1 }
    : { key: track.path, palette: track.cover, label: track.number }

  const nowPlayingContent = (
    <>
      <span className="player__cover" key={cover.key} data-palette={cover.palette} aria-hidden="true">
        <span className="player__cover-art">{cover.label}</span>
      </span>
      <span className="player__meta">
        <span className="player__label">Now playing</span>
        <span className="player__song marquee" ref={marqueeRef} data-overflow="false">
          <span className="marquee__track">
            <span className="marquee__text">{title}</span>
            <span className="marquee__text marquee__copy" aria-hidden="true">
              {title}
            </span>
          </span>
        </span>
      </span>
    </>
  )

  return (
    <section className="player" aria-label="Player" data-rm-fade="">

      <div className="player__now">
        {music.available ? (
          <button
            type="button"
            ref={queueButtonRef}
            className="player__nowbtn"
            aria-label={`Show the song queue. Now playing: ${title}`}
            aria-haspopup="dialog"
            aria-expanded={queueOpen}
            aria-controls={queueOpen ? queueId : undefined}
            onClick={() => setQueueOpen((value) => !value)}
          >
            {nowPlayingContent}
          </button>
        ) : (
          <div className="player__nowbtn">{nowPlayingContent}</div>
        )}
        {song?.credit && song.creditUrl ? (
          <a className="player__credit" href={song.creditUrl} target="_blank" rel="noreferrer">
            {song.credit}
            <span className="sr-only"> (license, opens in a new tab)</span>
          </a>
        ) : null}
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
            <MusicNextIcon width={18} height={18} />
          </button>
        ) : null}
        <QueuePopover id={queueId} open={queueOpen} onClose={closeQueue} triggerRef={queueButtonRef} />
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button
            type="button"
            className="player__btn player__btn--prev"
            aria-label={`Previous track: ${prev.title}`}
            title={`Previous: ${prev.title}`}
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
            aria-label={active ? `Pause ${what}` : `Play ${what}`}
            onClick={() => {
              sound.click()
              toggle()
            }}
          >
            <span className="pp" data-state={active ? 'playing' : 'paused'} aria-hidden="true">
              <span className="pp__half pp__half--l" />
              <span className="pp__half pp__half--r" />
            </span>
          </button>
          <button
            type="button"
            className="player__btn player__btn--next"
            aria-label={`Next track: ${next.title}`}
            title={`Next: ${next.title}`}
            onClick={() => {
              const target = stepTrack(navigate, pathname, 1)
              sound.switchTrack(target.number - 1)
            }}
          >
            <NextIcon />
          </button>
        </div>
        {music.available ? (
          <SeekBar time={music.time} duration={music.duration} />
        ) : (
          /* How far you've scrolled through this page. */
          <span className="player__progress" aria-hidden="true">
            <span className="player__fill" ref={fillRef} />
          </span>
        )}
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
