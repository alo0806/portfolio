import { useRef } from 'react'
import { usePlayer } from '../components/player/playerContext'
import useAudioFrame from '../hooks/useAudioFrame'
import { formatTime } from '../lib/formatTime'
import { SOUND } from '../sound/config'
import { seek, skip, useMusic } from '../sound/music'

const METERS = ['bass', 'mids', 'highs', 'pulse', 'level']

function paint(element, frame) {
  METERS.forEach((name) => {
    element.style.setProperty(`--${name}`, frame ? Math.abs(frame[name]).toFixed(3) : '0')
  })
  element.dataset.live = frame ? 'true' : 'false'
}

/* The music half of the lab: transport, and live meters of what the
   visuals see (the bands, the beat pulse, the level) for tuning the
   `analysis` block in config.js. */
export default function MusicLab() {
  const { playing, toggle } = usePlayer()
  const music = useMusic()
  const metersRef = useRef(null)
  useAudioFrame(metersRef, paint)

  if (!music.available) {
    return (
      <p className="lab__meta">
        No songs yet — add files to <code>public/audio/</code> and entries to <code>playlist</code> in
        content.js.
      </p>
    )
  }

  return (
    <>
      <p className="lab__meta">
        {music.song.title} — {music.song.artist} · {formatTime(music.time)} / {formatTime(music.duration)} · music
        level {SOUND.music.level}
      </p>
      <div className="lab__grid">
        <button type="button" className="lab__button" onClick={toggle}>
          <span className="lab__label">{playing ? 'Pause' : 'Play'}</span>
          <span className="lab__detail">music + motion</span>
        </button>
        <button type="button" className="lab__button" onClick={skip}>
          <span className="lab__label">Next song</span>
          <span className="lab__detail">{music.next ? music.next.title : 'loops this one'}</span>
        </button>
        <button type="button" className="lab__button" onClick={() => seek(music.duration - 4)}>
          <span className="lab__label">Jump near the end</span>
          <span className="lab__detail">hear the crossfade</span>
        </button>
      </div>
      <div className="lab__meters" ref={metersRef} data-live="false" aria-hidden="true">
        {METERS.map((name) => (
          <span key={name} className="lab__meter" style={{ '--v': `var(--${name}, 0)` }}>
            <span className="lab__meter-bar" />
            <span className="lab__detail">{name}</span>
          </span>
        ))}
      </div>
    </>
  )
}
