import { useEffect, useRef } from 'react'
import { sound } from '../../sound/engine'
import { useMusic } from '../../sound/music'
import Equalizer from '../Equalizer'
import { usePlayer } from './playerContext'

/* The song queue: a small panel above the player bar listing every song.
   The current one shows equalizer bars; picking another crossfades to it
   and plays. Opened from the now-playing area (cover + title).

   Keyboard: focus lands on the current song; ↑/↓ (and Home/End) move
   between songs; Enter plays; Esc closes and returns focus to the opener.
   A click outside, or tabbing away, closes it too. */
export default function QueuePopover({ id, open, onClose, triggerRef }) {
  const music = useMusic()
  const { playSong, musicOn } = usePlayer()
  const panelRef = useRef(null)

  // Focus the current song when it opens.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const current = panel?.querySelector('[aria-current="true"]') ?? panel?.querySelector('.queue__song')
    current?.focus()
  }, [open])

  // Esc, and clicks outside the panel (and its opener), close it.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (panelRef.current?.contains(event.target)) return
      if (triggerRef.current?.contains(event.target)) return // the opener toggles it itself
      onClose(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose(true)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, triggerRef])

  if (!open || !music.available) return null

  const moveFocus = (event) => {
    const buttons = [...panelRef.current.querySelectorAll('.queue__song')]
    const at = buttons.indexOf(document.activeElement)
    let next = null
    if (event.key === 'ArrowDown') next = (at + 1) % buttons.length
    else if (event.key === 'ArrowUp') next = (at - 1 + buttons.length) % buttons.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = buttons.length - 1
    if (next === null) return
    event.preventDefault()
    buttons[next].focus()
  }

  return (
    <div
      className="queue"
      id={id}
      ref={panelRef}
      role="dialog"
      aria-label="Queue"
      onKeyDown={moveFocus}
      onBlur={(event) => {
        // Tabbing out of the panel closes it (but not a click on the opener).
        const to = event.relatedTarget
        if (to && !panelRef.current.contains(to) && !triggerRef.current?.contains(to)) onClose(false)
      }}
    >
      <p className="queue__heading label">Queue</p>
      <ul className="queue__list">
        {music.songs.map((song, i) => {
          const current = i === music.index
          return (
            <li key={song.file} className="queue__item">
              <button
                type="button"
                className="queue__song"
                aria-current={current ? 'true' : undefined}
                onClick={() => {
                  sound.click()
                  playSong(i)
                }}
              >
                <span className="queue__lead" aria-hidden="true">
                  {current ? <Equalizer className="queue__eq" /> : <span className="num">{i + 1}</span>}
                </span>
                <span className="queue__text">
                  <span className="queue__title">{song.title}</span>
                  <span className="queue__artist">{song.artist}</span>
                </span>
                {current ? (
                  <span className="sr-only">{musicOn ? ', playing' : ', current song, paused'}</span>
                ) : null}
              </button>
              {song.credit && song.creditUrl ? (
                <a className="queue__credit" href={song.creditUrl} target="_blank" rel="noreferrer">
                  {song.credit}
                  <span className="sr-only"> (license, opens in a new tab)</span>
                </a>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
