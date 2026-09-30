import { useRef } from 'react'
import useAudioFrame from '../hooks/useAudioFrame'
import './Equalizer.css'

const BARS = ['--eq-bass', '--eq-mids', '--eq-highs']

function paint(element, frame) {
  if (!frame) {
    BARS.forEach((name) => element.style.removeProperty(name))
    return
  }
  element.style.setProperty(BARS[0], frame.bass.toFixed(3))
  element.style.setProperty(BARS[1], frame.mids.toFixed(3))
  element.style.setProperty(BARS[2], frame.highs.toFixed(3))
}

/* Three bars: bass, mids, highs. While music is playing they follow the
   real frequency bands; otherwise they bounce on the idle beat, and rest
   when paused. */
export default function Equalizer({ className = '' }) {
  const ref = useRef(null)
  useAudioFrame(ref, paint)

  return (
    <span className={`equalizer ${className}`.trim()} ref={ref} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}
