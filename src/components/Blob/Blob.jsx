import { useEffect, useRef } from 'react'
import usePointer from '../../hooks/usePointer'
import useReducedMotion from '../../hooks/useReducedMotion'
import useBlobState, { DOCK_SCALE } from './useBlobState'
import './Blob.css'

const TOUCH_STALE_MS = 2600
const FOLLOW_EASE = 0.14

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const mix = (from, to, t) => from + (to - from) * t
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/* Where the blob wants to be, in viewport coordinates, as its centre.
   Both anchors are derived from the viewport rather than written in CSS so
   that a later drag or hop can overwrite the same target. */

function heroAnchor(vw, vh) {
  if (vw < 760) return { x: vw * 0.62, y: vh * 0.74 }
  return { x: vw * 0.78, y: vh * 0.54 }
}

/* Dock size and inset are read from the stylesheet so they stay tunable
   there (and can differ per breakpoint) rather than being fixed in JS. */
function readToken(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name)
  const value = parseFloat(raw)
  return Number.isFinite(value) ? value : fallback
}

function dockAnchor(vw, vh, size) {
  const inset = readToken('--blob-dock-inset', 20)
  const half = (size * readToken('--blob-dock-scale', DOCK_SCALE)) / 2
  return { x: vw - inset - half, y: vh - inset - half }
}

export default function Blob() {
  const anchorRef = useRef(null)
  const bodyRef = useRef(null)
  const eyeLeftRef = useRef(null)
  const eyeRightRef = useRef(null)
  const pupilLeftRef = useRef(null)
  const pupilRightRef = useRef(null)

  const pointer = usePointer()
  const reduced = useReducedMotion()
  const blob = useBlobState()

  /* Scroll → dock. One input to the blob's target, not the owner of it;
     it stands down as soon as something else takes control. */
  useEffect(() => {
    let frame = 0

    const apply = () => {
      frame = 0
      const anchor = anchorRef.current
      if (!anchor || !blob.hasControl('scroll')) return

      const vw = window.innerWidth
      const vh = window.innerHeight
      const size = anchor.offsetWidth
      const hero = document.getElementById('hero')
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : vh
      const travel = Math.max(heroBottom - vh * 0.35, 240)
      const progress = easeInOut(clamp01(window.scrollY / travel))

      const from = heroAnchor(vw, vh)
      const to = dockAnchor(vw, vh, size)

      blob.setTarget(mix(from.x, to.x, progress), mix(from.y, to.y, progress))
      blob.setScale(mix(1, readToken('--blob-dock-scale', DOCK_SCALE), progress))

      if (!blob.state.placed) blob.snapToTarget()
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(apply)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    apply()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [blob])

  /* The one writer: eases position toward target and aims the pupils. */
  useEffect(() => {
    const anchor = anchorRef.current
    const eyeLeft = eyeLeftRef.current
    const eyeRight = eyeRightRef.current
    const pupilLeft = pupilLeftRef.current
    const pupilRight = pupilRightRef.current
    if (!anchor || !eyeLeft || !eyeRight || !pupilLeft || !pupilRight) {
      return undefined
    }

    const { state } = blob
    let frame = 0

    const aim = (eye, pupil, tx, ty, scale) => {
      const rect = eye.getBoundingClientRect()
      const dx = tx - (rect.left + rect.width / 2)
      const dy = ty - (rect.top + rect.height / 2)
      const distance = Math.hypot(dx, dy) || 1
      // Offsets are written in the eye's own unscaled space, so the parent's
      // scale has to be divided back out of the reach.
      const reach = Math.min(distance / (170 * scale), 1)
      const offset = reach * (eye.offsetWidth * 0.24)
      pupil.style.transform = `translate(${(dx / distance) * offset}px, ${
        (dy / distance) * offset
      }px)`
    }

    const tick = (now) => {
      const ease = reduced ? 1 : FOLLOW_EASE
      state.pos.x += (state.target.x - state.pos.x) * ease
      state.pos.y += (state.target.y - state.pos.y) * ease
      state.scale += (state.targetScale - state.scale) * ease

      const size = anchor.offsetWidth
      anchor.style.transform = `translate3d(${state.pos.x - size / 2}px, ${
        state.pos.y - size / 2
      }px, 0) scale(${state.scale})`

      const p = pointer.current
      const fresh = p.active && (!p.touch || now - p.at < TOUCH_STALE_MS)

      let tx
      let ty

      if (reduced) {
        // Eyes rest centred rather than tracking.
        tx = state.pos.x
        ty = state.pos.y
      } else if (fresh) {
        tx = p.x
        ty = p.y
      } else {
        // No cursor yet, or the last touch has gone stale: drift.
        const t = now / 1000
        tx = state.pos.x + Math.sin(t * 0.34) * 180
        ty = state.pos.y + Math.cos(t * 0.27) * 110
      }

      aim(eyeLeft, pupilLeft, tx, ty, state.scale)
      aim(eyeRight, pupilRight, tx, ty, state.scale)

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [blob, pointer, reduced])

  /* Blink. Written straight to the DOM so a blink never re-renders. */
  useEffect(() => {
    if (reduced) return undefined

    const body = bodyRef.current
    let openTimer = 0
    let nextTimer = 0

    const blink = () => {
      if (body) {
        body.dataset.blink = 'true'
        openTimer = window.setTimeout(() => {
          body.dataset.blink = 'false'
        }, 130)
      }
      nextTimer = window.setTimeout(blink, 2400 + Math.random() * 4200)
    }

    nextTimer = window.setTimeout(blink, 1800)

    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(nextTimer)
    }
  }, [reduced])

  return (
    <div className="blob-layer" aria-hidden="true">
      <div className="blob-anchor" ref={anchorRef}>
        <div className="blob-body" ref={bodyRef} data-blink="false">
          <div className="blob-eye blob-eye--left" ref={eyeLeftRef}>
            <span className="blob-pupil" ref={pupilLeftRef} />
          </div>
          <div className="blob-eye blob-eye--right" ref={eyeRightRef}>
            <span className="blob-pupil" ref={pupilRightRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
