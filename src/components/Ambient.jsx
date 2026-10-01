import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { canvasPixelRatio, onFrame } from '../lib/ticker'
import { readToken } from '../lib/tokens'
import { usePlayer } from './player/playerContext'
import './Ambient.css'

/* The intro's backdrop: a few soft particles rising, three slow waveform
   lines, and sound-ripple rings wherever you click. One canvas; particle
   glows are pre-rendered sprites (no shadowBlur); resolution is capped
   (canvasPixelRatio) and the particle count follows the screen's area
   within fixed bounds, so a big monitor doesn't get several times the
   work. It runs on the shared frame ticker, pauses off screen, and rests
   entirely while nothing moves (player paused, no ripples). Reduced
   motion draws one still frame and ignores clicks. */

const TAU = Math.PI * 2
const MAX_RIPPLES = 24
const PARTICLES = { perPixels: 30000, min: 14, max: 44 }

const rand = (min, max) => min + Math.random() * (max - min)

function hexToRgb(hex) {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function makeGlow([r, g, b]) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgba(${r},${g},${b},0.9)`)
  gradient.addColorStop(0.3, `rgba(${r},${g},${b},0.35)`)
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}

export default function Ambient({ className = '', interactive = false }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()
  const { playing } = usePlayer()
  const playingRef = useRef(playing)
  const wakeRef = useRef(null)

  useEffect(() => {
    playingRef.current = playing
    wakeRef.current?.()
  }, [playing])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return undefined

    const ctx = canvas.getContext('2d')
    const tones = [readToken('--on-indigo'), readToken('--accent'), readToken('--cover-plum-b')]
      .map((hex) => hexToRgb(hex || '#ffffff'))
    const glows = tones.map(makeGlow)
    const strokes = tones.map(([r, g, b]) => `${r},${g},${b}`)

    let width = 0
    let height = 0
    let particles = []
    let waves = []
    const ripples = []
    let clock = 0
    let stopTicking = null
    let onScreen = true

    const build = () => {
      const count = Math.round(
        Math.min(PARTICLES.max, Math.max(PARTICLES.min, (width * height) / PARTICLES.perPixels)),
      )
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(1.2, 3.4),
        tone: Math.random() < 0.12 ? 1 : Math.random() < 0.2 ? 2 : 0,
        alpha: rand(0.15, 0.5),
        rise: rand(4, 14),
        sway: rand(6, 18),
        phase: Math.random() * TAU,
      }))
      waves = [
        { y: 0.28, amp: 14, len: 0.006, speed: 0.35, alpha: 0.1, tone: 0 },
        { y: 0.74, amp: 22, len: 0.0045, speed: -0.25, alpha: 0.12, tone: 2 },
        { y: 0.84, amp: 10, len: 0.009, speed: 0.5, alpha: 0.08, tone: 1 },
      ]
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      ctx.lineWidth = 1.2
      for (const wave of waves) {
        ctx.strokeStyle = `rgba(${strokes[wave.tone]},${wave.alpha})`
        ctx.beginPath()
        const baseY = wave.y * height
        for (let x = 0; x <= width + 8; x += 8) {
          const y =
            baseY +
            Math.sin(x * wave.len + clock * wave.speed) * wave.amp +
            Math.sin(x * wave.len * 2.3 - clock * wave.speed * 0.7) * wave.amp * 0.35
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      for (const p of particles) {
        const x = p.x + Math.sin(clock * 0.4 + p.phase) * p.sway
        const d = p.r * 6
        ctx.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(clock * 0.8 + p.phase))
        ctx.drawImage(glows[p.tone], x - d / 2, p.y - d / 2, d, d)
      }
      ctx.globalAlpha = 1

      for (const ring of ripples) {
        if (ring.age < 0) continue
        const k = ring.age / ring.life
        const eased = 1 - (1 - k) ** 3
        ctx.strokeStyle = `rgba(${strokes[ring.tone]},${0.55 * (1 - k)})`
        ctx.lineWidth = 1.5 * (1 - k) + 0.5
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, 4 + eased * ring.reach, 0, TAU)
        ctx.stroke()
      }
    }

    const step = (dt) => {
      if (playingRef.current) {
        clock += dt
        for (const p of particles) {
          p.y -= p.rise * dt
          if (p.y < -20) {
            p.y = height + 20
            p.x = Math.random() * width
          }
        }
      }
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        ripples[i].age += dt
        if (ripples[i].age >= ripples[i].life) ripples.splice(i, 1)
      }
    }

    // Rest when nothing would change on screen: paused, and no ripples.
    const tick = (now, frameDt) => {
      if (!onScreen) {
        stopTicking = null
        return false
      }
      step(Math.min(frameDt, 1 / 20))
      draw()
      if (!playingRef.current && ripples.length === 0) {
        stopTicking = null
        return false
      }
      return true
    }

    const start = () => {
      if (reduced || stopTicking || !onScreen) return
      stopTicking = onFrame(tick)
    }

    const stop = () => {
      stopTicking?.()
      stopTicking = null
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const dpr = canvasPixelRatio()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
      draw()
    }

    /* Three rings, staggered, like sound leaving a point. */
    const ripple = (x, y) => {
      for (let i = 0; i < 3; i += 1) {
        ripples.push({ x, y, age: -i * 0.14, life: 1.2, reach: 150 + i * 30, tone: i === 0 ? 1 : 0 })
      }
      ripples.splice(0, Math.max(0, ripples.length - MAX_RIPPLES))
      start()
    }

    const onPointerDown = (event) => {
      if (!interactive || reduced) return
      const rect = canvas.getBoundingClientRect()
      ripple(event.clientX - rect.left, event.clientY - rect.top)
    }

    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(host)
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else stop()
    })
    visibility.observe(canvas)
    canvas.addEventListener('pointerdown', onPointerDown)
    resize()
    start()
    wakeRef.current = start

    return () => {
      wakeRef.current = null
      stop()
      sizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [interactive, reduced])

  return (
    <canvas
      ref={canvasRef}
      className={`ambient ${className}`.trim()}
      data-interactive={interactive ? 'true' : 'false'}
      aria-hidden="true"
    />
  )
}
