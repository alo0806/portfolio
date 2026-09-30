import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { readToken } from '../lib/tokens'
import './Starfield.css'

/* A drifting, twinkling star canvas. Built for 60fps:
   - every star's glow is a small pre-rendered sprite stamped with
     drawImage (shadowBlur is what usually sinks canvas frame rates)
   - star count scales with area and is capped; resolution caps at 2×
   - the loop only runs while the canvas is on screen
   Reduced motion draws a single still frame and ignores clicks. */

const TAU = Math.PI * 2
const MAX_DPR = 2
const MAX_PARTICLES = 320
const STAR_TOKENS = ['--star', '--star-teal', '--star-rose', '--star-gold', '--star-blue']

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

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
  gradient.addColorStop(0, `rgba(${r},${g},${b},1)`)
  gradient.addColorStop(0.16, `rgba(${r},${g},${b},0.95)`)
  gradient.addColorStop(0.38, `rgba(${r},${g},${b},0.28)`)
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}

function drawSparkle(ctx, x, y, radius, angle, fill, alpha) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalAlpha = alpha
  ctx.fillStyle = fill
  ctx.beginPath()
  for (let i = 0; i < 8; i += 1) {
    const reach = i % 2 === 0 ? radius : radius * 0.22
    const a = (i * Math.PI) / 4
    ctx.lineTo(Math.cos(a) * reach, Math.sin(a) * reach)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function createStars(width, height, density, maxStars, sparkleRatio, accents) {
  const count = Math.min(maxStars, Math.round(((width * height) / 10000) * density))
  return Array.from({ length: count }, () => {
    const depth = Math.random()
    const sparkle = Math.random() < sparkleRatio
    const accent = Math.random() < 0.09
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: sparkle ? rand(2.2, 4.6) : 0.35 + depth * 1.1 + Math.random() * 0.3,
      tone: accent || sparkle ? pick(accents) : 0,
      alpha: rand(0.35, 0.9),
      twinkle: rand(0.4, 2),
      phase: Math.random() * TAU,
      vx: -(2 + depth * 9),
      vy: -(0.5 + depth * 2.5),
      sparkle,
      angle: Math.random() * TAU,
      spin: (Math.random() < 0.5 ? -1 : 1) * rand(0.15, 0.6),
    }
  })
}

export default function Starfield({
  className = '',
  density = 2.2,
  maxStars = 260,
  sparkleRatio = 0.05,
  interactive = false,
}) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return undefined

    const ctx = canvas.getContext('2d')
    const colors = STAR_TOKENS.map((name) => hexToRgb(readToken(name) || '#ffffff'))
    const fills = colors.map(([r, g, b]) => `rgb(${r},${g},${b})`)
    const glows = colors.map(makeGlow)
    const accents = [1, 2, 3, 4]

    let width = 0
    let height = 0
    let stars = []
    const particles = []
    const rings = []
    let frame = 0
    let last = performance.now()
    let onScreen = true

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height)

      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.twinkle + s.phase)
        const alpha = s.alpha * twinkle
        const d = s.r * 7
        ctx.globalAlpha = alpha
        ctx.drawImage(glows[s.tone], s.x - d / 2, s.y - d / 2, d, d)
        if (s.sparkle) {
          drawSparkle(ctx, s.x, s.y, s.r * 2.4 * (0.8 + 0.2 * twinkle), s.angle, fills[s.tone], alpha)
        }
      }

      for (const ring of rings) {
        const k = ring.life / ring.max
        ctx.globalAlpha = 0.5 * (1 - k)
        ctx.strokeStyle = fills[0]
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, 6 + (1 - (1 - k) ** 3) * 46, 0, TAU)
        ctx.stroke()
      }

      for (const p of particles) {
        const k = p.life / p.max
        const alpha = 1 - k * k
        const d = p.r * 6
        ctx.globalAlpha = alpha
        ctx.drawImage(glows[p.tone], p.x - d / 2, p.y - d / 2, d, d)
        if (p.sparkle) drawSparkle(ctx, p.x, p.y, p.r * 2.2, p.angle, fills[p.tone], alpha)
      }

      ctx.globalAlpha = 1
    }

    const step = (dt) => {
      for (const s of stars) {
        s.x += s.vx * dt
        s.y += s.vy * dt
        if (s.sparkle) s.angle += s.spin * dt
        if (s.x < -12) s.x += width + 24
        if (s.y < -12) s.y += height + 24
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.life += dt
        if (p.life >= p.max) {
          particles.splice(i, 1)
          continue
        }
        const drag = 1 - 2.6 * dt
        p.vx *= drag
        p.vy = p.vy * drag + 18 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.angle += p.spin * dt
      }

      for (let i = rings.length - 1; i >= 0; i -= 1) {
        rings[i].life += dt
        if (rings[i].life >= rings[i].max) rings.splice(i, 1)
      }
    }

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20)
      last = now
      step(dt)
      draw(now / 1000)
      frame = requestAnimationFrame(loop)
    }

    const start = () => {
      if (reduced || frame || !onScreen) return
      last = performance.now()
      frame = requestAnimationFrame(loop)
    }

    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = createStars(width, height, density, maxStars, sparkleRatio, accents)
      draw(performance.now() / 1000)
    }

    const burst = (x, y) => {
      rings.push({ x, y, life: 0, max: 0.55 })
      const count = 16
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * TAU + rand(-0.15, 0.15)
        const speed = rand(70, 220)
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: rand(0.6, 1.05),
          r: rand(1.2, 3.2),
          tone: Math.random() < 0.5 ? 0 : pick(accents),
          sparkle: Math.random() < 0.4,
          angle: Math.random() * TAU,
          spin: rand(-6, 6),
        })
      }
      particles.splice(0, Math.max(0, particles.length - MAX_PARTICLES))
    }

    const onPointerDown = (event) => {
      if (!interactive || reduced) return
      const rect = canvas.getBoundingClientRect()
      burst(event.clientX - rect.left, event.clientY - rect.top)
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

    return () => {
      stop()
      sizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [density, maxStars, sparkleRatio, interactive, reduced])

  return (
    <canvas
      ref={canvasRef}
      className={`starfield ${className}`.trim()}
      data-interactive={interactive ? 'true' : 'false'}
      aria-hidden="true"
    />
  )
}
