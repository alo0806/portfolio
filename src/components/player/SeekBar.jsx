import { useEffect, useRef, useState } from 'react'
import { formatTime } from '../../lib/formatTime'
import { seek } from '../../sound/music'

const STEP = 5 // seconds per arrow key
const PAGE = 15

/* The player's progress bar, showing the song instead of the scroll.
   It looks exactly like the scroll bar it replaces (same element, same
   size); an invisible native range input on top makes it seekable —
   click or drag (the jump happens on release), or keys: ←/→ 5 s,
   Page Up/Down 15 s, Home/End. Elapsed and length sit either side. */
export default function SeekBar({ time, duration }) {
  const inputRef = useRef(null)
  const [scrub, setScrub] = useState(null)
  const ready = duration > 0
  const shown = scrub ?? Math.min(time, ready ? duration : time)
  const progress = ready ? Math.min(1, shown / duration) : 0

  // The native "change" event fires once, on release — seek then.
  useEffect(() => {
    const input = inputRef.current
    const commit = () => {
      seek(Number(input.value))
      setScrub(null)
    }
    input.addEventListener('change', commit)
    return () => input.removeEventListener('change', commit)
  }, [])

  const onKeyDown = (event) => {
    const jumps = {
      ArrowLeft: -STEP,
      ArrowDown: -STEP,
      ArrowRight: STEP,
      ArrowUp: STEP,
      PageDown: -PAGE,
      PageUp: PAGE,
    }
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
      <span className="seek__time num" aria-hidden="true">
        {formatTime(shown)}
      </span>
      <span className="seek__bar">
        <span className="player__progress" aria-hidden="true">
          <span className="player__fill" style={{ transform: `scaleX(${progress.toFixed(4)})` }} />
        </span>
        <input
          ref={inputRef}
          type="range"
          className="seek__input"
          min="0"
          max={ready ? duration : 1}
          step="any"
          value={ready ? shown : 0}
          disabled={!ready}
          aria-label="Seek"
          aria-valuetext={`${formatTime(shown)} of ${formatTime(duration)}`}
          onChange={(event) => setScrub(Number(event.target.value))}
          onKeyDown={onKeyDown}
        />
      </span>
      <span className="seek__time num" aria-hidden="true">
        {ready ? formatTime(duration) : '-:--'}
      </span>
    </div>
  )
}
