import { useEffect, useState } from 'react'

/* The current time, ticking on the second boundary so the display never
   lags a real clock by most of a second. */

export default function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer = 0
    const tick = () => {
      const date = new Date()
      setNow(date)
      timer = window.setTimeout(tick, 1000 - date.getMilliseconds() + 5)
    }
    timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds() + 5)
    return () => window.clearTimeout(timer)
  }, [])

  return now
}
