import { SOUND } from '../sound/config'
import { setSoundOn, setVolume, sound, useSoundOn, useVolume } from '../sound/engine'
import { SpeakerOffIcon, SpeakerOnIcon } from './icons'

/* Mute button, next to the volume slider. Sound is on by default; muting
   lasts for the session. Unmuting with the slider at zero brings it back
   to a sensible level, then plays a soft two-note hello. */
export default function SoundToggle({ className = '' }) {
  const on = useSoundOn()
  const volume = useVolume()
  const audible = on && volume > 0

  const toggle = () => {
    if (audible) {
      setSoundOn(false)
      return
    }
    if (volume === 0) setVolume(SOUND.volume.initial)
    setSoundOn(true)
    sound.confirm()
  }

  return (
    <button
      type="button"
      className={`player__btn player__btn--sound ${className}`.trim()}
      aria-pressed={!audible}
      aria-label="Mute sound"
      title={audible ? 'Mute' : 'Unmute'}
      onClick={toggle}
    >
      {audible ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
    </button>
  )
}
