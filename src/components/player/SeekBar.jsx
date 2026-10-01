import { useEffect, useRef } from 'react'
import { formatTime } from '../../lib/formatTime'
import { getTime, seek, subscribeTime } from '../../sound/music'

const STEP = 5 // seconds per arrow key
const PAGE = 15

/* The player's progress bar, showing the song instead of the scroll.
   It looks exactly like the scroll bar it replaces (same element, same
   size); an invisible native range input on top makes it seekable —
   click or drag (the jump happens on release), or keys: ←/→ 5 s,
   Page Up/Down 15 s, Home/End. Elapsed and length sit either side.

   The position changes several times a second, so it never goes through
   React state: the bar subscribes to the music's time channel and writes
   the fill, the elapsed time and the slider straight to the DOM. */
export default function SeekBar({ duration }) {
  const inputRef = useRef(null)
  const fillRef = useRef(null)
  const elapsedRef = useRef(null)
  const scrubbingRef = useRef(false)
  const ready = duration > 0

  useEffect(() => {
    const input = inputRef.current
    const fill = fillRef.current
    const elapsed = elapsedRef.current

    const paint = (time) => {
      const shown = ready ? Math.min(time, duration) : 0
      fill.style.transform = `scaleX(${ready ? (shown / duration).toFixed(4) : 0})`
      elapsed.textContent = formatTime(shown)
      input.setAttribute('aria-valuetext', `${formatTime(shown)} of ${formatTime(duration)}`)
      return shown
    }

    const onTime = () => {
      if (scrubbingRef.current) return // a drag in progress shows its own position
      input.value = String(paint(getTime()))
    }

    // Dragging: preview where it will land; the native "change" event fires
    // once, on release — seek then.
    const onInput = () => {
      scrubbingRef.current = true
      paint(Number(input.value))
    }
    const onChange = () => {
      scrubbingRef.current = false
      seek(Number(input.value))
    }

    onTime()
    const unsubscribe = subscribeTime(onTime)
    input.addEventListener('input', onInput)
    input.addEventListener('change', onChange)
    return () => {
      unsubscribe()
      input.removeEventListener('input', onInput)
      input.removeEventListener('change', onChange)
    }
  }, [duration, ready])

  const onKeyDown = (event) => {
    const jumps = {
      ArrowLeft: -STEP,
      ArrowDown: -STEP,
      ArrowRight: STEP,
      ArrowUp: STEP,
      PageDown: -PAGE,
      PageUp: PAGE,
    }
    const time = getTime()
    let target = null
    if (event.key in jumps) target = time + jumps[event.key]
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = duration
    if (target === null) return
    event.preventDefault()
    seek(Math.min(Math.max(0, target), duration))
  }

  return (
    <div className="seek">
      <span className="seek__time num" ref={elapsedRef} aria-hidden="true">
        0:00
      </span>
      <span className="seek__bar">
        <span className="player__progress" aria-hidden="true">
          <span className="player__fill" ref={fillRef} />
        </span>
        <input
          ref={inputRef}
          type="range"
          className="seek__input"
          min="0"
          max={ready ? duration : 1}
          step="any"
          defaultValue={0}
          disabled={!ready}
          aria-label="Seek"
          onKeyDown={onKeyDown}
        />
      </span>
      <span className="seek__time num" aria-hidden="true">
        {ready ? formatTime(duration) : '-:--'}
      </span>
    </div>
  )
}
