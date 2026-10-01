import { useEffect, useRef } from 'react'
import './Waveform.css'

const BARS = 48

/* A row of bars rising and falling at slightly different rates — a
   waveform built in CSS, so it pauses with the player and holds still
   under reduced motion. Heights and timings are fixed per bar (not
   random) so the shape is stable between renders. Off screen, the bars
   stop animating (no work for something nobody can see). */
export default function Waveform({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const onScreen = new IntersectionObserver(([entry]) => {
      el.dataset.offscreen = entry.isIntersecting ? 'false' : 'true'
    })
    onScreen.observe(el)
    return () => onScreen.disconnect()
  }, [])

  return (
    <div className={`waveform ${className}`.trim()} ref={ref} aria-hidden="true">
      {Array.from({ length: BARS }, (_, i) => {
        const envelope = Math.sin((i / (BARS - 1)) * Math.PI)
        const height = 0.18 + envelope * (0.55 + 0.27 * Math.sin(i * 1.7))
        return (
          <span
            key={i}
            style={{
              '--h': height.toFixed(3),
              '--d': `${(0.9 + ((i * 37) % 11) / 10).toFixed(2)}s`,
              '--delay': `${(-((i * 53) % 17) / 10).toFixed(2)}s`,
            }}
          />
        )
      })}
    </div>
  )
}
