import { useId, useLayoutEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Equalizer from '../components/Equalizer'
import { PlayIcon } from '../components/icons'
import { TRACKS } from '../data/tracks'
import { prepareTrackClick } from '../lib/trackNav'

/* The page switcher, as a tracklist. Each row is a real link (with a view
   transition). Hovering a row swaps its number for ▶; the current page
   shows equalizer bars instead. One highlight glides to the active row.
   Times are each page's reading time, formatted like a track length. */
export default function Tracklist({ onNavigate }) {
  const labelId = useId()
  const { pathname } = useLocation()
  const listRef = useRef(null)
  const indicatorRef = useRef(null)

  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (!list || !indicator) return
    const active = list.querySelector('[aria-current="page"]')
    if (!active) {
      indicator.style.opacity = '0'
      return
    }
    indicator.style.opacity = '1'
    indicator.style.height = `${active.offsetHeight}px`
    indicator.style.transform = `translateY(${active.offsetTop}px)`
    if (indicator.dataset.ready !== 'true') {
      requestAnimationFrame(() => {
        indicator.dataset.ready = 'true'
      })
    }
  }, [pathname])

  return (
    <nav className="tracklist" aria-labelledby={labelId}>
      <h2 className="label panel-heading" id={labelId}>
        Tracklist
      </h2>
      <div className="tracklist__frame">
        <span className="tracklist__indicator" ref={indicatorRef} aria-hidden="true" />
        <ol className="tracklist__list" ref={listRef}>
          {TRACKS.map((track, index) => (
            <li key={track.path} style={{ '--row': index }}>
              <NavLink
                to={track.path}
                viewTransition
                className="track"
                onClick={() => {
                  // Runs before the link navigates: sets the slide
                  // direction from this row's position.
                  prepareTrackClick(pathname, track.path)
                  onNavigate?.()
                }}
              >
                <span className="track__lead" aria-hidden="true">
                  <span className="track__number">{track.number}</span>
                  <PlayIcon className="track__play" width={14} height={14} />
                  <Equalizer className="track__eq" />
                </span>
                <span className="track__title">{track.title}</span>
                <span className="track__time num">
                  <span className="sr-only">, reading time </span>
                  {track.time}
                </span>
              </NavLink>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
