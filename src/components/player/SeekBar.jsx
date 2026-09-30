import { useEffect, useRef, useState } from 'react'
import { formatTime } from '../../lib/formatTime'
import { seek } from '../../sound/music'

const STEP = 5 // seconds per arrow key
const PAGE = 15

/* The song's progress: elapsed on the left, length on the right. Click or
   drag the bar to seek (the jump happens on release), or use the keys:
   ←/→ 5 s, Page Up/Down 15 s, Home/End. Disabled until a song's length
   is known. */
export default function SeekBar({ time, duration }) {
  const inputRef = useRef(null)
  const [scrub, setScrub] = useState(null)
  const shown = scrub ?? Math.min(time, duration || time)
  const ready = duration > 0
  const fill = ready ? (shown / duration) * 100 : 0

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
      <span className="seek__time num">{formatTime(shown)}</span>
      <input
        ref={inputRef}
        type="range"
        className="range seek__input"
        min="0"
        max={ready ? duration : 1}
        step="any"
        value={ready ? shown : 0}
        disabled={!ready}
        aria-label="Seek"
        aria-valuetext={`${formatTime(shown)} of ${formatTime(duration)}`}
        style={{ '--fill': `${fill}%` }}
        onChange={(event) => setScrub(Number(event.target.value))}
        onKeyDown={onKeyDown}
      />
      <span className="seek__time num">{ready ? formatTime(duration) : '-:--'}</span>
    </div>
  )
}
