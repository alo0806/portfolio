import { useEffect } from 'react'
import { SOUND } from '../sound/config'
import { scaleFrequency, sound } from '../sound/engine'
import { TRACKS } from '../data/tracks'
import './SoundLab.css'

/* Dev-only (/sounds): every sound, one button each. Plays regardless of
   the site's sound toggle and ignores throttling, so you can tune
   src/sound/config.js by ear — save, and click again. */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const nameOf = (freq) => {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440))
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

const force = { force: true }

const GROUPS = [
  {
    title: 'Navigation',
    items: [
      ...TRACKS.map((track, i) => ({
        label: `Row note · ${track.title}`,
        detail: nameOf(scaleFrequency(SOUND.tracks[i].degree, SOUND.tracks[i].octave)),
        play: () => sound.trackNote(i, force),
      })),
      ...TRACKS.map((track, i) => ({
        label: `Row hover · ${track.title}`,
        detail: 'very quiet',
        play: () => sound.trackNote(i, { soft: true, force: true }),
      })),
      { label: 'Prev / next → My Work', detail: 'click + note', play: () => sound.switchTrack(0, force) },
      { label: 'Play / pause', detail: 'click', play: () => sound.click(force) },
    ],
  },
  {
    title: 'The record',
    items: [
      { label: 'Needle drop', detail: 'thump', play: () => sound.needleDrop(force) },
      { label: 'Vinyl crackle', detail: `${SOUND.crackle.duration}s`, play: () => sound.crackle(force) },
      {
        label: 'Press play (full)',
        detail: 'needle + crackle, as timed on the intro',
        play: () => {
          sound.needleDrop({ delay: 0.36, force: true })
          sound.crackle({ delay: 0.42, duration: 0.86, force: true })
        },
      },
      { label: 'Back to the record', detail: 'tape stop', play: () => sound.tapeStop(force) },
    ],
  },
  {
    title: 'Small things',
    items: [
      { label: 'Mascot babble', detail: 'one blip per word', play: () => sound.babble('oh — you found me.', force) },
      { label: 'Card hover', detail: 'texture', play: () => sound.texture(force) },
      { label: 'Sound on', detail: 'confirm', play: () => sound.confirm(force) },
      { label: 'Volume slider', detail: 'note on release', play: () => sound.preview(force) },
    ],
  },
]

export default function SoundLab() {
  useEffect(() => {
    document.title = 'Sound lab — Austin Lo'
  }, [])

  const scale = SOUND.key.scale.map((_, degree) => nameOf(scaleFrequency(degree, 4)))

  return (
    <main id="main" className="lab">
      <header className="lab__head">
        <p className="lab__tag">Dev only</p>
        <h1 className="lab__title">Sound lab</h1>
        <p className="lab__meta">
          Key: {scale.join(' · ')} · effects level {SOUND.sfx.level} · slider starts at {SOUND.volume.initial} · tune in{' '}
          <code>src/sound/config.js</code>
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.title} className="lab__group" aria-labelledby={`lab-${group.title}`}>
          <h2 className="lab__group-title" id={`lab-${group.title}`}>
            {group.title}
          </h2>
          <div className="lab__grid">
            {group.items.map((item) => (
              <button key={item.label} type="button" className="lab__button" onClick={item.play}>
                <span className="lab__label">{item.label}</span>
                <span className="lab__detail">{item.detail}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
