import { setSoundOn, setVolume, sound, useSoundOn, useVolume } from '../sound/engine'

/* The player bar's volume: one slider over sound effects and any future
   background music. Dragging it up while muted unmutes. Letting go (or
   an arrow key) plays one soft note at the new level. */
export default function VolumeSlider() {
  const on = useSoundOn()
  const volume = useVolume()
  const shown = on ? volume : 0

  const change = (event) => {
    const value = Number(event.target.value)
    setVolume(value)
    if (!on && value > 0) setSoundOn(true)
  }

  return (
    <input
      type="range"
      className="range volume"
      min="0"
      max="1"
      step="0.05"
      value={shown}
      aria-label="Volume"
      aria-valuetext={`${Math.round(shown * 100)}%`}
      style={{ '--fill': `${shown * 100}%` }}
      onChange={change}
      onPointerUp={() => sound.preview()}
      onKeyUp={(event) => {
        if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') sound.preview()
      }}
    />
  )
}
