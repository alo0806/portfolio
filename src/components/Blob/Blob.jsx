import { useEffect, useRef, useState } from 'react'
import { useActiveSection } from '../../context/sectionContexts'
import usePointer from '../../hooks/usePointer'
import useReducedMotion from '../../hooks/useReducedMotion'
import useToken from '../../hooks/useToken'
import { readToken } from '../../lib/tokens'
import { useBlob } from './blobContext'
import {
  HEAD_SPRINGS,
  RADII,
  TRAIL_STIFFNESS,
  TRAIL_ZETA,
  restOffset,
  snap,
  spring,
} from './blobPhysics'
import useBlobControls from './useBlobControls'
import './Blob.css'

const KEY_SPEED = 460 // px per second while steering
const MAX_DT = 1 / 30 // a dropped frame never becomes a teleport
const HAPPY_MS = 700

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function findHome(sectionId) {
  return document.querySelector(`#${sectionId ?? 'hero'} [data-blob-home]`)
}

export default function Blob() {
  const blob = useBlob()
  const active = useActiveSection()
  const reduced = useReducedMotion()
  const pointer = usePointer()
  const radius = useToken('--blob-r', 34)
  const circleToken = useToken('--blob-circles', 6)
  const blur = useToken('--goo-blur', 10)
  const circles = clamp(Math.round(circleToken), 1, RADII.length)
  const [steering, setSteering] = useState(false)

  const svgRef = useRef(null)
  const massRef = useRef(null)
  const eyesRef = useRef(null)
  const whiteLeftRef = useRef(null)
  const whiteRightRef = useRef(null)
  const pupilLeftRef = useRef(null)
  const pupilRightRef = useRef(null)
  const handleRef = useRef(null)
  const hintRef = useRef(null)
  const homeElRef = useRef(null)
  const activeRef = useRef(active)
  const blinkRef = useRef(false)
  const configRef = useRef(null)

  const enabled = !reduced
  const controls = useBlobControls({ blob, handleRef, enabled, setSteering })

  /* A new chapter calls the blob home — unless someone is steering it. */
  useEffect(() => {
    activeRef.current = active
    homeElRef.current = findHome(active)
    if (blob.hasControl('free')) blob.releaseControl()
  }, [active, blob])

  useEffect(() => {
    if (reduced) blob.takeControl('static')
    else if (blob.hasControl('static')) blob.releaseControl()
  }, [blob, reduced])

  /* Leash length, cursor gap, drift and idle time come from tokens.css
     and change per breakpoint. */
  useEffect(() => {
    const read = () => {
      configRef.current = {
        leash: readToken('--blob-leash', 120),
        gap: readToken('--blob-gap', 90),
        drift: readToken('--blob-drift', 18),
        idleMs: readToken('--blob-idle-ms', 2800),
      }
    }
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  /* Blink every few seconds. Flags a ref; the loop eases the lids. */
  useEffect(() => {
    if (reduced) return undefined
    let openTimer = 0
    let nextTimer = 0
    const blink = () => {
      blinkRef.current = true
      openTimer = window.setTimeout(() => {
        blinkRef.current = false
      }, 140)
      nextTimer = window.setTimeout(blink, 2600 + Math.random() * 4200)
    }
    nextTimer = window.setTimeout(blink, 2200)
    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(nextTimer)
      blinkRef.current = false
    }
  }, [reduced])

  /* The one writer. Picks a target from whoever has control, springs the
     head toward it, chains the trail behind, and draws. */
  useEffect(() => {
    const svg = svgRef.current
    const mass = massRef.current
    const eyes = eyesRef.current
    const whites = [whiteLeftRef.current, whiteRightRef.current]
    const pupils = [pupilLeftRef.current, pupilRightRef.current]
    if (!svg || !mass || !eyes) return undefined

    const state = blob.state
    const circleEls = Array.from(mass.children)
    const eyeSpacing = radius * 0.34
    const look = { x: 0, y: 0 }
    let lid = 1
    let last = performance.now()
    let frame = 0

    const readHome = () => {
      let el = homeElRef.current
      if (!el || !el.isConnected) {
        el = findHome(activeRef.current)
        homeElRef.current = el
      }
      if (!el) return { x: window.innerWidth * 0.7, y: window.innerHeight * 0.6 }
      const rect = el.getBoundingClientRect()
      return { x: rect.left, y: rect.top }
    }

    const start = readHome()
    blob.resizeTrail(circles - 1)
    if (!state.placed) blob.place(start.x, start.y)

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, MAX_DT)
      last = now
      const t = now / 1000
      const cfg = configRef.current
      const head = state.head
      const home = readHome()
      blob.setHome(home.x, home.y)

      const p = pointer.current
      const cursorLive = p.active && !p.touch && now - p.at < cfg.idleMs

      if (state.control === 'static') {
        snap(head, home.x, home.y)
        state.trail.forEach((body, i) => {
          const offset = restOffset(i, 0, radius)
          snap(body, home.x + offset.x, home.y + offset.y)
        })
      } else {
        let tx = home.x
        let ty = home.y

        if (state.control === 'drag') {
          tx = state.target.x
          ty = state.target.y
        } else if (state.control === 'keyboard') {
          const pad = radius * 1.4
          tx = clamp(
            state.target.x + state.keys.x * KEY_SPEED * dt,
            pad,
            window.innerWidth - pad,
          )
          ty = clamp(
            state.target.y + state.keys.y * KEY_SPEED * dt,
            pad,
            window.innerHeight - pad,
          )
          blob.setTarget(tx, ty)
        } else if (state.control === 'free' && state.free) {
          tx = state.free.x
          ty = state.free.pageY - window.scrollY
        } else if (cursorLive) {
          // Leashed: lean toward the cursor, but never past the leash and
          // never closer than the gap, so it can't sit under a click.
          const dx = p.x - home.x
          const dy = p.y - home.y
          const distance = Math.hypot(dx, dy) || 1
          const reach = clamp(distance - cfg.gap, 0, cfg.leash)
          tx = home.x + (dx / distance) * reach
          ty = home.y + (dy / distance) * reach
        } else {
          // Idle: drift on its own, slowly.
          tx += (Math.sin(t * 0.29) + 0.35 * Math.sin(t * 0.71 + 1.3)) * cfg.drift
          ty += (Math.cos(t * 0.23) + 0.3 * Math.sin(t * 0.53)) * cfg.drift * 0.7
        }

        const pull = HEAD_SPRINGS[state.control] ?? HEAD_SPRINGS.follow
        spring(head, tx, ty, pull.k, pull.zeta, dt)

        let leader = head
        state.trail.forEach((body, i) => {
          const offset = restOffset(i, t, radius)
          spring(
            body,
            leader.x + offset.x,
            leader.y + offset.y,
            TRAIL_STIFFNESS[i] ?? 60,
            TRAIL_ZETA,
            dt,
          )
          leader = body
        })
      }

      // ── Draw the mass ──
      circleEls[0].setAttribute('cx', head.x.toFixed(1))
      circleEls[0].setAttribute('cy', head.y.toFixed(1))
      state.trail.forEach((body, i) => {
        const el = circleEls[i + 1]
        if (!el) return
        el.setAttribute('cx', body.x.toFixed(1))
        el.setAttribute('cy', body.y.toFixed(1))
      })

      // ── Eyes: ride the head, lead slightly into motion ──
      const speed = Math.hypot(head.vx, head.vy)
      const lead = Math.min(speed * 0.012, radius * 0.22)
      const ex = head.x + (speed ? (head.vx / speed) * lead : 0)
      const ey = head.y - radius * 0.1 + (speed ? (head.vy / speed) * lead : 0)
      eyes.setAttribute('transform', `translate(${ex.toFixed(1)} ${ey.toFixed(1)})`)

      let gx = 0
      let gy = 0
      let span = 160
      if (state.control === 'static') {
        gx = 0
        gy = 0
      } else if (state.control === 'drag' || state.control === 'keyboard') {
        if (speed > 20) {
          gx = head.vx
          gy = head.vy
          span = 1
        }
      } else if (cursorLive) {
        gx = p.x - ex
        gy = p.y - ey
      } else {
        gx = Math.sin(t * 0.4) * 200
        gy = Math.cos(t * 0.31) * 120
      }
      const gaze = Math.hypot(gx, gy)
      const reachEye = radius * 0.09 * Math.min(gaze / span, 1)
      const lx = gaze ? (gx / gaze) * reachEye : 0
      const ly = gaze ? (gy / gaze) * reachEye : 0
      look.x += (lx - look.x) * 0.2
      look.y += (ly - look.y) * 0.2

      if (state.mood === 'happy' && now - state.moodAt > HAPPY_MS) {
        blob.setMood('idle')
      }
      let lidTarget = 1
      if (blinkRef.current) lidTarget = 0.1
      else if (state.mood === 'happy') lidTarget = 0.35
      else if (state.mood === 'held') lidTarget = 1.12
      lid += (lidTarget - lid) * 0.45

      whites.forEach((white) => {
        white?.setAttribute('ry', (radius * 0.25 * lid).toFixed(2))
      })
      pupils.forEach((pupil, i) => {
        if (!pupil) return
        const side = i === 0 ? -1 : 1
        pupil.setAttribute('cx', (side * eyeSpacing + look.x).toFixed(2))
        pupil.setAttribute('cy', look.y.toFixed(2))
        pupil.setAttribute('r', (radius * 0.1 * Math.min(lid, 1)).toFixed(2))
      })

      // ── Hit area and hint follow the head ──
      const handle = handleRef.current
      if (handle) {
        handle.style.transform = `translate3d(${head.x - radius}px, ${
          head.y - radius
        }px, 0)`
      }
      const hint = hintRef.current
      if (hint) {
        hint.style.transform = `translate3d(${head.x}px, ${
          head.y + radius * 2
        }px, 0) translateX(-50%)`
      }

      if (svg.dataset.ready !== 'true') svg.dataset.ready = 'true'
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [blob, pointer, radius, circles])

  const eyeSpacing = radius * 0.34

  return (
    <>
      <svg className="blob-svg" ref={svgRef} aria-hidden="true" focusable="false">
        <defs>
          <filter
            id="blob-goo"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            />
          </filter>
        </defs>
        <g className="blob-mass" filter="url(#blob-goo)" ref={massRef}>
          {Array.from({ length: circles }, (_, i) => (
            <circle key={i} r={radius * RADII[i]} />
          ))}
        </g>
        <g className="blob-eyes" ref={eyesRef}>
          <ellipse
            ref={whiteLeftRef}
            className="blob-eye"
            cx={-eyeSpacing}
            cy={0}
            rx={radius * 0.2}
            ry={radius * 0.25}
          />
          <ellipse
            ref={whiteRightRef}
            className="blob-eye"
            cx={eyeSpacing}
            cy={0}
            rx={radius * 0.2}
            ry={radius * 0.25}
          />
          <circle ref={pupilLeftRef} className="blob-pupil" cx={-eyeSpacing} cy={0} r={radius * 0.1} />
          <circle ref={pupilRightRef} className="blob-pupil" cx={eyeSpacing} cy={0} r={radius * 0.1} />
        </g>
      </svg>

      {enabled ? (
        <button
          ref={handleRef}
          type="button"
          className="blob-handle"
          style={{ width: radius * 2, height: radius * 2 }}
          aria-pressed={steering}
          aria-label={
            steering
              ? 'Steering the blob. Arrow keys or WASD move it; Escape lets go.'
              : 'Blob companion. Press to steer it with the arrow keys.'
          }
          {...controls}
        />
      ) : null}

      <p
        ref={hintRef}
        className="ui-label blob-hint"
        data-show={steering && enabled ? 'true' : 'false'}
        aria-hidden="true"
      >
        Arrows to move · Esc to let go
      </p>
    </>
  )
}
