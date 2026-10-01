import { usePlayer } from '../components/player/playerContext'
import { formatTime } from '../lib/formatTime'
import { SOUND } from '../sound/config'
import { seek, skip, useMusic, useMusicTime } from '../sound/music'

/* The music half of the lab: the playlist's transport, for checking
   songs, crossfades and levels (config.js → music). */
export default function MusicLab() {
  const { musicOn, toggle } = usePlayer()
  const music = useMusic()
  const time = useMusicTime()

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
        {music.song.title} — {music.song.artist} · {formatTime(time)} / {formatTime(music.duration)} ·
        music level {SOUND.music.level}
      </p>
      <div className="lab__grid">
        <button type="button" className="lab__button" onClick={toggle}>
          <span className="lab__label">{musicOn ? 'Pause' : 'Play'}</span>
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
    </>
  )
}
