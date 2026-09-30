import { useCallback, useEffect, useMemo, useState } from 'react'
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
   equalizer, the mascot's bob, the cover spin. There's no audio. The
   state is mirrored to <html data-playing> so CSS can pause every loop
   from one place, and remembered for the session. */
export default function PlayerProvider({ children }) {
  const [playing, setPlaying] = useState(readPlaying)

  useEffect(() => {
    document.documentElement.dataset.playing = playing ? 'true' : 'false'
    try {
      window.sessionStorage.setItem(KEY, String(playing))
    } catch {
      // Not persisted; harmless.
    }
  }, [playing])

  const toggle = useCallback(() => setPlaying((value) => !value), [])
  const value = useMemo(() => ({ playing, toggle }), [playing, toggle])

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
