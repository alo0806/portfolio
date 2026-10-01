import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { onFrame } from '../lib/ticker'
import { SOUND } from '../sound/config'
import { scratchVoice } from '../sound/scratch'
import { usePlayer } from './player/playerContext'
import './Record.css'

const BASE_SPEED = 40 // degrees per second: a slow, idle turn
const FAST_SPEED = 720 // "press play": two revolutions a second
const EASE_NORMAL = 3.5 // how quickly speed changes (per second)
const EASE_SPINUP = 9 // spin-up reaches ~97% of full speed in ~400ms
const BLUR_ABOVE = 300 // label motion-blurs above this speed
const GRIP_SMOOTHING = 0.05 // seconds: how quickly a drag's speed is read
const SCRATCHED_AFTER = 20 // degrees of dragging that count as "a scratch"

/* A vinyl record drawn in CSS: concentric grooves, a label, and a light
   reflection that stays put while the disc turns beneath it (that
   stillness is what makes it read as a real record).

   The spin runs from JS as angle + speed rather than a CSS keyframe, so
   speed can ramp — spin up on "press play", drift down on pause —
   without the jump a keyframe restart causes. Only transform changes.

   startFast: begin at full speed and drift down (coming back from the
   site). crackle: a quick burst of visual vinyl grain. The label blurs
   whenever the disc is actually turning fast, in either direction.

   scratchable: it can be grabbed and turned (mouse, pen or touch). While
   held it follows the pointer's angle around the centre, and a stretch
   of the first song plays at its speed, backwards too (sound/scratch.js).
   Let go and it keeps that speed, easing back to its idle turn while the
   sound follows it down and fades. Under reduced motion it stops where
   it's let go. onScratch fires once, after the first real turn. */
export default function Record({
  label,
  fast = false,
  startFast = false,
  crackle = false,
  scratchable = false,
  onScratch,
  className = '',
  ref,
}) {
  const recordRef = useRef(null)
  const discRef = useRef(null)
  const { playing } = usePlayer()
  const reduced = useReducedMotion()
  const targetRef = useRef({ fast, playing, reduced })
  const startFastRef = useRef(startFast)
  const wakeRef = useRef(null)
  const scratchRef = useRef({ scratchable, onScratch })
  const letGoRef = useRef(null)

  useEffect(() => {
    scratchRef.current = { scratchable, onScratch }
    if (!scratchable) letGoRef.current?.()
  }, [scratchable, onScratch])

  useEffect(() => {
    targetRef.current = { fast, playing, reduced }
    if (fast) letGoRef.current?.({ silent: true })
    wakeRef.current?.()
  }, [fast, playing, reduced])

  // The page measures the outer element (the iris grows from it); hand
  // it on as well as keeping it here.
  const setRecord = (element) => {
    recordRef.current = element
    if (typeof ref === 'function') ref(element)
    else if (ref) ref.current = element
  }

  useEffect(() => {
    const record = recordRef.current
    const disc = discRef.current
    if (!record || !disc) return undefined

    let angle = Math.random() * 360
    let speed = startFastRef.current && !targetRef.current.reduced ? FAST_SPEED : 0
    let blurred = false
    let stopTicking = null

    // Grabbing it.
    let grip = null // { id, cx, cy, last } while held
    let pending = 0 // degrees the pointer has turned it since the last frame
    let turned = 0 // degrees turned in this drag, either way
    let scratched = false
    let sounding = false // the scratch still following a released spin

    // On the shared ticker; rests once the disc has fully stopped and
    // wakes again when the target speed changes or it's grabbed.
    const tick = (now, frameDt) => {
      const dt = Math.min(frameDt, 1 / 20)
      const target = targetRef.current
      const goal = target.reduced ? 0 : target.fast ? FAST_SPEED : target.playing ? BASE_SPEED : 0

      if (grip) {
        // Held: the disc goes exactly where the pointer took it; its speed
        // is the pointer's (smoothed a little), and the scratch follows.
        const moved = pending
        pending = 0
        angle = (angle + moved + 360) % 360
        // (The first frame after waking can have no elapsed time.)
        if (dt > 0) speed += (moved / dt - speed) * (1 - Math.exp(-dt / GRIP_SMOOTHING))
        scratchVoice.set(speed, 1)
      } else {
        const rate = target.fast ? EASE_SPINUP : EASE_NORMAL
        speed += (goal - speed) * (1 - Math.exp(-rate * dt))
        angle = (angle + speed * dt + 360) % 360

        // Let go with momentum: the scratch keeps playing at the disc's
        // speed and fades out as it comes back to its idle turn.
        if (sounding) {
          const left = Math.min(1, Math.abs(speed - goal) / SOUND.scratch.fadeBelow)
          const level = left * left * (3 - 2 * left)
          scratchVoice.set(speed, level)
          if (level < 0.01) {
            sounding = false
            scratchVoice.set(speed, 0)
          }
        }
      }

      disc.style.transform = `rotate(${angle.toFixed(2)}deg)`
      const blur = Math.abs(speed) > BLUR_ABOVE
      if (blur !== blurred) {
        blurred = blur
        disc.dataset.blur = blur ? 'true' : 'false'
      }
      if (!grip && !sounding && goal === 0 && Math.abs(speed) < 0.5) {
        speed = 0
        stopTicking = null
        disc.dataset.turning = 'false'
        return false
      }
      return true
    }

    const wake = () => {
      if (stopTicking) return
      disc.dataset.turning = 'true'
      stopTicking = onFrame(tick)
    }
    wakeRef.current = wake

    const angleAt = (event) =>
      (Math.atan2(event.clientY - grip.cy, event.clientX - grip.cx) * 180) / Math.PI

    const onDown = (event) => {
      if (!scratchRef.current.scratchable || targetRef.current.fast || grip) return
      if (event.button !== 0) return
      event.preventDefault()
      const rect = record.getBoundingClientRect()
      grip = { id: event.pointerId, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
      grip.last = angleAt(event)
      try {
        record.setPointerCapture(event.pointerId)
      } catch {
        // Not capturable (an unusual pointer): the drag still works over the record.
      }
      record.dataset.gripped = 'true'
      pending = 0
      turned = 0
      sounding = false
      scratchVoice.prepare()
      wake()
    }

    const onMove = (event) => {
      if (!grip || event.pointerId !== grip.id) return
      // Right at the centre the angle means nothing: wait for it.
      if (Math.hypot(event.clientX - grip.cx, event.clientY - grip.cy) < 8) return
      const now = angleAt(event)
      const delta = ((now - grip.last + 540) % 360) - 180
      grip.last = now
      pending += delta
      turned += Math.abs(delta)
      if (!scratched && turned > SCRATCHED_AFTER) {
        scratched = true
        scratchRef.current.onScratch?.()
      }
    }

    // Let go: momentum carries on (not under reduced motion). `silent`
    // ends the sound at once instead, when "press play" takes over.
    const letGo = ({ silent = false } = {}) => {
      if (!grip) {
        if (silent && sounding) {
          sounding = false
          scratchVoice.silence()
        }
        return
      }
      const { id } = grip
      grip = null
      if (record.hasPointerCapture?.(id)) record.releasePointerCapture(id)
      record.dataset.gripped = 'false'
      angle = (angle + pending + 360) % 360
      pending = 0
      if (targetRef.current.reduced) speed = 0
      sounding = !silent && !targetRef.current.reduced
      if (!sounding) scratchVoice.silence()
      wake()
    }
    letGoRef.current = letGo

    const onUp = (event) => {
      if (grip && event.pointerId === grip.id) letGo()
    }

    record.addEventListener('pointerdown', onDown)
    record.addEventListener('pointermove', onMove)
    record.addEventListener('pointerup', onUp)
    record.addEventListener('pointercancel', onUp)
    record.addEventListener('lostpointercapture', onUp)

    disc.style.transform = `rotate(${angle}deg)`
    wake()
    return () => {
      stopTicking?.()
      wakeRef.current = null
      letGoRef.current = null
      scratchVoice.silence()
      record.removeEventListener('pointerdown', onDown)
      record.removeEventListener('pointermove', onMove)
      record.removeEventListener('pointerup', onUp)
      record.removeEventListener('pointercancel', onUp)
      record.removeEventListener('lostpointercapture', onUp)
    }
  }, [])

  return (
    <div
      className={`record ${className}`.trim()}
      ref={setRecord}
      data-crackle={crackle ? 'true' : 'false'}
      data-scratchable={scratchable ? 'true' : 'false'}
      data-gripped="false"
      data-cursor={scratchable ? 'grab' : undefined}
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
