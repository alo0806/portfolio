import { useEffect, useRef, useState } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion'
import { onFrame } from '../../lib/ticker'
import './MiniRecord.css'

const SPEED = 120 // degrees per second at full speed (one turn every 3s)
const EASE = 7 // per second: speeds settle in ~0.6s, both stopping and starting
const STILL = 2 // below this (deg/s) with nothing pushing it, the disc has stopped

/* A tiny vinyl record for the player bar, in the intro record's style:
   dark disc, fine grooves, the current song's cover as the round centre
   label (or its colour and number), and a light reflection that stays
   put while the disc turns underneath it.

   It turns only while `spinning`. The spin runs from JS as angle + speed,
   so pausing eases it to a stop (~600ms) and playing eases it back up —
   no jumps. When the label changes, the new one fades in over the old.
   Under reduced motion it doesn't turn at all. */
export default function MiniRecord({ label, spinning }) {
  const reduced = useReducedMotion()
  const discRef = useRef(null)
  const spinningRef = useRef(spinning)
  const startRef = useRef(null)

  // Labels stacked for the crossfade: the newest fades in on top, then
  // the ones beneath are dropped (see onAnimationEnd below).
  const [layers, setLayers] = useState([label])
  if (layers.at(-1).key !== label.key) {
    setLayers([...layers.slice(-1), label])
  }

  useEffect(() => {
    const disc = discRef.current
    if (!disc || reduced) return undefined
    let angle = 0
    let speed = spinningRef.current ? SPEED : 0
    let stopTicking = null

    const tick = (now, dt) => {
      const goal = spinningRef.current ? SPEED : 0
      speed += (goal - speed) * (1 - Math.exp(-EASE * dt))
      if (goal === 0 && speed < STILL) speed = 0
      angle = (angle + speed * dt) % 360
      disc.style.transform = `rotate(${angle.toFixed(2)}deg)`
      // Settled and stopped: leave the ticker until play is pressed.
      if (goal === 0 && speed === 0) {
        stopTicking = null
        disc.dataset.turning = 'false'
        return false
      }
      return true
    }

    startRef.current = () => {
      if (stopTicking) return
      disc.dataset.turning = 'true'
      stopTicking = onFrame(tick)
    }
    if (spinningRef.current) startRef.current()

    return () => {
      stopTicking?.()
      startRef.current = null
      disc.style.transform = ''
      disc.dataset.turning = 'false'
    }
  }, [reduced])

  // Play / pause: change the goal; the loop eases toward it.
  useEffect(() => {
    spinningRef.current = spinning
    startRef.current?.()
  }, [spinning])

  return (
    <span className="minirec" aria-hidden="true">
      <span className="minirec__disc" ref={discRef}>
        <span className="minirec__grooves" />
        <span className="minirec__label">
          {layers.map((layer, i) => (
            <span
              key={layer.key}
              className="minirec__face"
              data-palette={layer.image ? undefined : layer.palette}
              data-entering={i === layers.length - 1 && layers.length > 1 ? 'true' : 'false'}
              onAnimationEnd={() => setLayers((current) => current.slice(-1))}
            >
              {layer.image ? (
                <img src={layer.image} alt="" width="40" height="40" decoding="async" />
              ) : (
                <span className="minirec__number">{layer.number}</span>
              )}
            </span>
          ))}
          <span className="minirec__hole" />
        </span>
      </span>
      <span className="minirec__sheen" />
    </span>
  )
}
