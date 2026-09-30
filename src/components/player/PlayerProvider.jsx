import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMusic, pause as pauseMusic, play as playMusic, useMusic } from '../../sound/music'
import { PlayerContext } from './playerContext'

const KEY = 'astnlo:playing'

function readPlaying() {
  try {
    return window.sessionStorage.getItem(KEY) !== 'false'
  } catch {
    return true
  }
}

/* "Playing" means the site's ambient motion is on: the record, the
   equalizer, the mascot's bob, the cover spin. The state is mirrored to
   <html data-playing> so CSS can pause every loop from one place, and
   remembered for the session.

   Music (when the playlist has songs) sits on top of that:
   - the motion runs by default, with no music until someone presses
     play ("press play" on the intro, or the player's play button) —
     browsers only allow audio after a click
   - while music plays, pause stops the music and the motion together;
     play starts both
   - with no songs, play/pause toggles the motion alone, as before
   play() / toggle() must be called from a click handler (a user
   gesture), not an effect, so the browser lets the music start. */
export default function PlayerProvider({ children }) {
  const [playing, setPlaying] = useState(readPlaying)
  const music = useMusic()

  useEffect(() => {
    document.documentElement.dataset.playing = playing ? 'true' : 'false'
    try {
      window.sessionStorage.setItem(KEY, String(playing))
    } catch {
      // Not persisted; harmless.
    }
  }, [playing])

  // Music + motion on (the intro's "press play" passes a fade-in delay).
  const play = useCallback((options) => {
    playMusic(options)
    setPlaying(true)
  }, [])

  const toggle = useCallback(() => {
    const current = getMusic()
    if (!current.available) {
      setPlaying((value) => !value)
    } else if (current.playing) {
      pauseMusic()
      setPlaying(false)
    } else {
      playMusic()
      setPlaying(true)
    }
  }, [])

  const musicOn = music.available && music.playing
  const value = useMemo(() => ({ playing, musicOn, play, toggle }), [playing, musicOn, play, toggle])

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
