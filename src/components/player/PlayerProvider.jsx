import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { hasMusic, onBlocked, pause as pauseMusic, play as playMusic } from '../../sound/music'
import { PlayerContext } from './playerContext'

const KEY = 'astnlo:playing'

/* After a reload the browser won't start audio without a fresh click, so
   with music the site comes back paused (at the saved position); without
   music, the motion alone can resume. */
function readPlaying() {
  try {
    return window.sessionStorage.getItem(KEY) === 'true' && !hasMusic()
  } catch {
    return false
  }
}

/* "Playing" means the music and the site's ambient motion together: the
   record, the equalizers, the mascot's bob, the cover spin. It starts
   paused — "press play" on the intro (or the player's play button) is
   what starts it, since browsers only allow audio after a click. The
   state is mirrored to <html data-playing> so CSS can pause every loop
   from one place, and remembered for the session.

   play() / pause() must be called from a user gesture (a click handler),
   not an effect, so the browser lets the music start. */
export default function PlayerProvider({ children }) {
  const [playing, setPlaying] = useState(readPlaying)
  const playingRef = useRef(playing)

  useEffect(() => {
    playingRef.current = playing
    document.documentElement.dataset.playing = playing ? 'true' : 'false'
    try {
      window.sessionStorage.setItem(KEY, String(playing))
    } catch {
      // Not persisted; harmless.
    }
  }, [playing])

  // The browser refused to start the music: show paused.
  useEffect(() => onBlocked(() => setPlaying(false)), [])

  const play = useCallback((options) => {
    playMusic(options)
    playingRef.current = true
    setPlaying(true)
  }, [])

  const pause = useCallback(() => {
    pauseMusic()
    playingRef.current = false
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (playingRef.current) pause()
    else play()
  }, [play, pause])

  const value = useMemo(() => ({ playing, play, pause, toggle }), [playing, play, pause, toggle])

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
