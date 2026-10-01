import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import { onFrame } from '../../lib/ticker'
import { DEMO_LENGTH, DEMO_STROKES, DEMO_TIMING } from './demo'
import DrawOverlay from './DrawOverlay'
import { colorMap, drawAll, drawStroke, fitCanvas, getSnapshot, subscribe } from './engine'
import './SymmetryDraw.css'

// The card is short and wide: let the pattern be larger than its height,
// so it reads as a detail of something bigger rather than a tiny medallion.
const cardRadius = (w, h) => Math.max(h * 0.8, Math.min(w, h) / 2)

/* The looping demo: pre-scripted strokes traced one by one, then a
   pause, a fade, and again. It only runs while the card is on screen,
   the canvas is empty, and the site's player isn't paused; under reduced
   motion it's drawn once, finished, and left still. */
function DemoCanvas({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    let frame = fitCanvas(canvas, cardRadius)
    let stopTicking = null
    let time = 0
    let visible = false
    const reduced = prefersReducedMotion()
    const html = document.documentElement
    const paused = () => html.dataset.playing === 'false'

    const render = () => {
      const { ctx } = frame
      const colors = colorMap()
      ctx.clearRect(0, 0, frame.w, frame.h)
      if (reduced) {
        DEMO_STROKES.forEach((stroke) => drawStroke(ctx, frame, stroke, colors))
        return
      }
      const drawing = DEMO_STROKES.length * DEMO_TIMING.perStroke
      const fadeFrom = drawing + DEMO_TIMING.hold
      ctx.globalAlpha = time > fadeFrom ? Math.max(0, 1 - (time - fadeFrom) / DEMO_TIMING.fade) : 1
      DEMO_STROKES.forEach((stroke, i) => {
        const progress = Math.min(1, Math.max(0, time / DEMO_TIMING.perStroke - i))
        if (progress <= 0) return
        const upTo = Math.max(1, Math.ceil(progress * stroke.points.length))
        drawStroke(ctx, frame, stroke, colors, upTo)
      })
      ctx.globalAlpha = 1
    }

    // On the shared ticker only while it can actually be seen moving:
    // active (no drawing yet), on screen, and the site not paused.
    const running = () => active && visible && !paused() && !reduced
    const tick = (now, dt) => {
      if (!running()) {
        stopTicking = null
        return false
      }
      time = (time + dt) % DEMO_LENGTH
      render()
      return true
    }
    const wake = () => {
      if (running() && !stopTicking) stopTicking = onFrame(tick)
    }

    const resize = new ResizeObserver(() => {
      frame = fitCanvas(canvas, cardRadius)
      render()
    })
    resize.observe(canvas)
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      wake()
    })
    onScreen.observe(canvas)
    // The site's play / pause (data-playing on <html>).
    const playState = new MutationObserver(wake)
    playState.observe(html, { attributes: true, attributeFilter: ['data-playing'] })

    render()
    wake()

    return () => {
      stopTicking?.()
      resize.disconnect()
      onScreen.disconnect()
      playState.disconnect()
    }
  }, [active])

  return <canvas className="symdraw__layer symdraw__demo" ref={canvasRef} aria-hidden="true" />
}

/* The visitor's own drawing, as the card's background once there is one. */
function ArtCanvas({ strokes }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const draw = () => {
      const frame = fitCanvas(canvas, cardRadius)
      drawAll(frame.ctx, frame, strokes)
    }
    draw()
    const resize = new ResizeObserver(draw)
    resize.observe(canvas)
    return () => resize.disconnect()
  }, [strokes])

  return <canvas className="symdraw__layer symdraw__art" ref={canvasRef} aria-hidden="true" />
}

/* A small drawing toy for the Playground: radial symmetry, like a
   kaleidoscope. The card is one button; it opens into a near-fullscreen
   canvas (DrawOverlay). The drawing is kept in memory for the session. */
export default function SymmetryDraw() {
  const [open, setOpen] = useState(false)
  const cardRef = useRef(null)
  const { strokes } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const hasDrawing = strokes.length > 0

  return (
    <>
      <button
        type="button"
        ref={cardRef}
        className="symdraw"
        data-surface="dark"
        data-has-drawing={hasDrawing ? 'true' : 'false'}
        aria-haspopup="dialog"
        aria-label={
          hasDrawing
            ? 'Open the symmetry drawing toy and keep drawing'
            : 'Open the symmetry drawing toy'
        }
        onClick={() => setOpen(true)}
      >
        <DemoCanvas active={!hasDrawing && !open} />
        <ArtCanvas strokes={strokes} />
        <span className="symdraw__pill" aria-hidden="true">
          tap to draw
        </span>
      </button>
      {open ? (
        <DrawOverlay cardRef={cardRef} onClosed={() => setOpen(false)} />
      ) : null}
    </>
  )
}
