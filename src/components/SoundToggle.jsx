import { setSoundOn, sound, useSoundOn } from '../sound/engine'
import { SpeakerOffIcon, SpeakerOnIcon } from './icons'

/* Sound effects are off by default. Turning them on (a click, so the
   browser allows audio) plays a soft two-note hello; the choice lasts
   for the session. */
export default function SoundToggle({ className = '' }) {
  const on = useSoundOn()

  const toggle = () => {
    const next = !on
    setSoundOn(next)
    if (next) sound.confirm()
  }

  return (
    <button
      type="button"
      className={`player__btn player__btn--sound ${className}`.trim()}
      aria-pressed={on}
      aria-label="Sound effects"
      title={on ? 'Turn sound effects off' : 'Turn sound effects on'}
      onClick={toggle}
    >
      {on ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
    </button>
  )
}
