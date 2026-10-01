import { useEffect, useRef, useState } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion'
import { PauseIcon, PlayIcon } from '../icons'
import '../covers.css'
import './Media.css'

const VISIBLE = 0.5 // share of a video that must be on screen for it to play

const typeOf = (src) => (src?.endsWith('.webm') ? 'video/webm' : 'video/mp4')

/* One piece of project media in a box of fixed proportions (`ratio`,
   width/height, '16/9' by default), so nothing shifts while it loads.
   Images are lazy and decoded off the main thread; a placeholder
   (src: null) is a coloured frame. Videos: see MediaVideo. */
export default function Media({ item, fit = 'cover', decorative = false, className = '' }) {
  const ratio = item.ratio ?? '16/9'
  const style = { aspectRatio: ratio }
  const cls = `media media--${fit} ${className}`.trim()

  if (!item.src) {
    return (
      <div className={`${cls} media--placeholder`} style={style} data-palette={item.palette ?? 'sunset'}>
        <span className="media__placeholder-label">Placeholder</span>
      </div>
    )
  }
  if (item.type === 'video') {
    return <MediaVideo item={item} className={cls} style={style} decorative={decorative} />
  }
  return (
    <div className={cls} style={style}>
      <img src={item.src} alt={decorative ? '' : (item.alt ?? '')} loading="lazy" decoding="async" />
    </div>
  )
}

/* A short, muted, looping clip with a poster. It downloads nothing until
   it's near the screen, plays only while at least half of it is visible,
   and pauses off screen, in a hidden tab, or while the site is paused
   (the player's pause button — <html data-playing>).

   Under reduced motion it never starts by itself: the poster shows with
   a play button, and it plays (with controls) only when asked. Outside
   a link (decorative = false) a small pause button sits in the corner, so
   the loop can always be stopped. `fullVideo` adds a "watch full video"
   link. */
function MediaVideo({ item, className, style, decorative }) {
  const reduced = useReducedMotion()
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(false) // stopped by its own button
  const [started, setStarted] = useState(false) // reduced motion: play was pressed
  const pausedRef = useRef(false)
  const syncRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || reduced) return undefined
    const html = document.documentElement
    let visible = false

    const sync = () => {
      const play = visible && !document.hidden && html.dataset.playing !== 'false' && !pausedRef.current
      if (play && video.paused) video.play().catch(() => {})
      else if (!play && !video.paused) video.pause()
    }

    const seen = new IntersectionObserver(
      ([entry]) => {
        // Near the screen: start downloading. Mostly on it: play.
        if (entry.isIntersecting && video.preload === 'none') video.preload = 'auto'
        visible = entry.intersectionRatio >= VISIBLE
        sync()
      },
      { threshold: [0, VISIBLE], rootMargin: '200px 0px' },
    )
    seen.observe(video)
    const playState = new MutationObserver(sync)
    playState.observe(html, { attributes: true, attributeFilter: ['data-playing'] })
    document.addEventListener('visibilitychange', sync)
    syncRef.current = sync
    return () => {
      syncRef.current = null
      seen.disconnect()
      playState.disconnect()
      document.removeEventListener('visibilitychange', sync)
      video.pause()
    }
  }, [reduced])

  const toggle = (event) => {
    event.stopPropagation()
    const next = !paused
    pausedRef.current = next
    setPaused(next)
    syncRef.current?.()
  }

  const start = (event) => {
    event.stopPropagation()
    setStarted(true)
    const video = videoRef.current
    video.preload = 'auto'
    video.play().catch(() => {})
  }

  return (
    <div className={`${className} media--video`} style={style}>
      <video
        ref={videoRef}
        muted
        loop={!reduced}
        playsInline
        preload="none"
        poster={item.poster}
        controls={reduced && started}
        aria-label={decorative ? undefined : item.alt}
        aria-hidden={decorative ? 'true' : undefined}
        tabIndex={decorative ? -1 : undefined}
      >
        <source src={item.src} type={typeOf(item.src)} />
      </video>

      {reduced && !started && !decorative ? (
        <button type="button" className="media__play" aria-label="Play video" onClick={start}>
          <PlayIcon width={22} height={22} />
        </button>
      ) : null}

      {!reduced && !decorative ? (
        <button
          type="button"
          className="media__toggle"
          aria-label={paused ? 'Play video' : 'Pause video'}
          aria-pressed={paused}
          onClick={toggle}
        >
          {paused ? <PlayIcon width={14} height={14} /> : <PauseIcon width={14} height={14} />}
        </button>
      ) : null}

      {item.fullVideo && !decorative ? (
        <a className="media__full" href={item.fullVideo} target="_blank" rel="noreferrer">
          Watch full video <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  )
}
