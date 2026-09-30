import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { usePlayer } from './player/playerContext'
import './Record.css'

const BASE_SPEED = 40 // degrees per second: a slow, idle turn
const FAST_SPEED = 720 // "press play": two revolutions a second
const EASE_NORMAL = 3.5 // how quickly speed changes (per second)
const EASE_SPINUP = 9 // spin-up reaches ~97% of full speed in ~400ms
const BLUR_ABOVE = 300 // label motion-blurs above this speed

/* A vinyl record drawn in CSS: concentric grooves, a label, and a light
   reflection that stays put while the disc turns beneath it (that
   stillness is what makes it read as a real record).

   The spin runs from JS as angle + speed rather than a CSS keyframe, so
   speed can ramp — spin up on "press play", drift down on pause —
   without the jump a keyframe restart causes. Only transform changes.

   startFast: begin at full speed and drift down (coming back from the
   site). idle: keep the slow turn even while the player is paused (the
   intro's turntable is always waiting). crackle: a quick burst of visual vinyl grain. The label blurs
   whenever the disc is actually turning fast, in either direction. */
export default function Record({
  label,
  fast = false,
  startFast = false,
  crackle = false,
  idle = false,
  className = '',
  ref,
}) {
  const discRef = useRef(null)
  const { playing } = usePlayer()
  const reduced = useReducedMotion()
  const turning = playing || idle
  const targetRef = useRef({ fast, turning, reduced })
  const startFastRef = useRef(startFast)

  useEffect(() => {
    targetRef.current = { fast, turning, reduced }
  }, [fast, turning, reduced])

  useEffect(() => {
    const disc = discRef.current
    if (!disc) return undefined

    let angle = Math.random() * 360
    let speed = startFastRef.current && !targetRef.current.reduced ? FAST_SPEED : 0
    let blurred = false
    let last = performance.now()
    let frame = 0

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20)
      last = now
      const target = targetRef.current
      const goal = target.reduced ? 0 : target.fast ? FAST_SPEED : target.turning ? BASE_SPEED : 0
      const rate = target.fast ? EASE_SPINUP : EASE_NORMAL
      speed += (goal - speed) * (1 - Math.exp(-rate * dt))
      angle = (angle + speed * dt) % 360
      disc.style.transform = `rotate(${angle.toFixed(2)}deg)`
      const blur = speed > BLUR_ABOVE
      if (blur !== blurred) {
        blurred = blur
        disc.dataset.blur = blur ? 'true' : 'false'
      }
      frame = requestAnimationFrame(tick)
    }

    disc.style.transform = `rotate(${angle}deg)`
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={`record ${className}`.trim()}
      ref={ref}
      data-crackle={crackle ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div className="record__disc" ref={discRef}>
        <div className="record__grooves" />
        <div className="record__label">
          <span className="record__label-text">{label}</span>
          <span className="record__label-side">side a</span>
          <span className="record__hole" />
        </div>
      </div>
      <div className="record__sheen" />
      <div className="record__crackle" />
    </div>
  )
}
