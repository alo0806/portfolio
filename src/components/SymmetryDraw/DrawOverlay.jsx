import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { insetsBetween, OVERLAY_RADIUS as RADIUS } from '../../lib/growOverlay'
import { duration, ease, prefersReducedMotion } from '../../lib/motion'
import {
  COLORS,
  SIZES,
  SYMMETRY,
  addStroke,
  clear,
  drawAll,
  drawStroke,
  drawStrokeTail,
  exportPng,
  fitCanvas,
  getSnapshot,
  resolveColor,
  setSettings,
  subscribe,
  undo,
} from './engine'
import { ClearIcon, CloseIcon, MinusIcon, MirrorIcon, PlusIcon, SaveIcon, UndoIcon } from './icons'

/* The drawing toy, opened: a near-fullscreen canvas that grows out of the
   card and shrinks back into it. It's rendered at the top of <body> (a
   portal), above the player bar and sidebar; the rest of the site is made
   inert while it's open, so focus stays inside. Esc or × closes it. */
export default function DrawOverlay({ cardRef, onClosed }) {
  const { strokes, settings, canUndo } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const canvasRef = useRef(null)
  const dotRef = useRef(null)
  const frameRef = useRef(null)
  const strokeRef = useRef(null) // the stroke being drawn right now
  const closingRef = useRef(false)
  const [status, setStatus] = useState('')

  // Lock the page behind, and grow out of the card.
  useLayoutEffect(() => {
    const root = document.getElementById('root')
    const html = document.documentElement
    const cardEl = cardRef.current
    root?.setAttribute('inert', '')
    html.style.overflow = 'hidden'
    panelRef.current?.focus({ preventScroll: true })

    const card = cardEl?.getBoundingClientRect()
    const panel = panelRef.current?.getBoundingClientRect()
    if (card && panel && !prefersReducedMotion()) {
      const options = { duration: duration('base'), easing: ease('out') }
      panelRef.current.animate(
        [{ clipPath: insetsBetween(panel, card) }, { clipPath: `inset(0px 0px 0px 0px round ${RADIUS}px)` }],
        options,
      )
      backdropRef.current.animate([{ opacity: 0 }, { opacity: 1 }], options)
    }

    return () => {
      root?.removeAttribute('inert')
      html.style.overflow = ''
      // Back to the card — only possible once the page isn't inert.
      cardEl?.focus({ preventScroll: true })
    }
  }, [cardRef])

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    const card = cardRef.current?.getBoundingClientRect()
    const panel = panelRef.current?.getBoundingClientRect()
    if (!card || !panel || prefersReducedMotion()) {
      onClosed()
      return
    }
    const options = { duration: duration('base'), easing: ease('in-out'), fill: 'forwards' }
    backdropRef.current.animate([{ opacity: 1 }, { opacity: 0 }], options)
    panelRef.current
      .animate(
        [{ clipPath: `inset(0px 0px 0px 0px round ${RADIUS}px)` }, { clipPath: insetsBetween(panel, card) }],
        options,
      )
      .finished.then(onClosed, onClosed)
  }, [cardRef, onClosed])

  // Keep the canvas sharp and the drawing whole through resizes, and
  // redraw after undo / clear.
  useEffect(() => {
    const canvas = canvasRef.current
    const draw = () => {
      frameRef.current = fitCanvas(canvas)
      drawAll(frameRef.current.ctx, frameRef.current, strokes)
    }
    draw()
    const resize = new ResizeObserver(draw)
    resize.observe(canvas)
    return () => resize.disconnect()
  }, [strokes])

  const toUnits = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const { cx, cy, r } = frameRef.current
    return [(event.clientX - rect.left - cx) / r, (event.clientY - rect.top - cy) / r]
  }

  const moveDot = (event) => {
    const dot = dotRef.current
    if (!dot) return
    const panel = panelRef.current.getBoundingClientRect()
    dot.style.transform = `translate(${event.clientX - panel.left}px, ${event.clientY - panel.top}px)`
    dot.dataset.show = event.pointerType === 'touch' ? 'false' : 'true'
  }

  const onPointerDown = (event) => {
    if (strokeRef.current) return // one stroke at a time (ignore extra fingers)
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture(event.pointerId) // keep the stroke if it leaves the canvas
    } catch {
      // The pointer is already gone (e.g. a very quick tap); draw anyway.
    }
    const frame = frameRef.current
    const size = SIZES.find((s) => s.id === settings.size) ?? SIZES[1]
    strokeRef.current = {
      pointerId: event.pointerId,
      color: resolveColor(settings.color),
      stroke: {
        color: settings.color,
        width: size.px / frame.r,
        n: settings.n,
        mirror: settings.mirror,
        points: [toUnits(event)],
      },
    }
    drawStroke(frame.ctx, frame, strokeRef.current.stroke, { [settings.color]: strokeRef.current.color })
  }

  const onPointerMove = (event) => {
    moveDot(event)
    const active = strokeRef.current
    if (!active || active.pointerId !== event.pointerId) return
    const frame = frameRef.current
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [event]
    for (const sample of samples.length ? samples : [event]) {
      const point = toUnits(sample)
      const prev = active.stroke.points.at(-1)
      // Skip sub-pixel jitter; the curve between samples does the smoothing.
      if (Math.hypot((point[0] - prev[0]) * frame.r, (point[1] - prev[1]) * frame.r) < 1) continue
      active.stroke.points.push(point)
      drawStrokeTail(frame.ctx, frame, active.stroke, active.color)
    }
  }

  const endStroke = (event) => {
    const active = strokeRef.current
    if (!active || active.pointerId !== event.pointerId) return
    strokeRef.current = null
    addStroke(active.stroke) // redraws everything, finishing the curve cleanly
  }

  const save = async () => {
    const frame = frameRef.current
    const blob = await exportPng(strokes, frame.w, frame.h)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'symmetry-drawing.png'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Saved as symmetry-drawing.png')
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      undo()
    }
  }

  const size = SIZES.find((s) => s.id === settings.size) ?? SIZES[1]

  return createPortal(
    <div className="symdraw-overlay">
      <div className="symdraw-overlay__backdrop" ref={backdropRef} />
      <div
        className="symdraw-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Symmetry drawing"
        tabIndex={-1}
        data-surface="dark"
        onKeyDown={onKeyDown}
      >
        <canvas
          className="symdraw-panel__canvas"
          ref={canvasRef}
          aria-label={`Drawing canvas, ${settings.n}-fold symmetry${settings.mirror ? ', mirrored' : ''}`}
          role="img"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onLostPointerCapture={endStroke}
          onPointerEnter={moveDot}
          onPointerLeave={() => {
            if (dotRef.current) dotRef.current.dataset.show = 'false'
          }}
        />
        <span
          className="symdraw-panel__dot"
          ref={dotRef}
          data-show="false"
          aria-hidden="true"
          style={{ '--dot': `${size.px}px`, '--dot-color': `var(${settings.color})` }}
        />

        <div className="symdraw-tools" role="toolbar" aria-label="Drawing tools">
          <div className="symdraw-tools__group" role="group" aria-label="Colour">
            {COLORS.map((color) => (
              <button
                key={color.token}
                type="button"
                className="symdraw-tool symdraw-swatch"
                aria-label={color.label}
                aria-pressed={settings.color === color.token}
                style={{ '--swatch': `var(${color.token})` }}
                onClick={() => setSettings({ color: color.token })}
              />
            ))}
          </div>

          <div className="symdraw-tools__group" role="group" aria-label="Symmetry">
            <button
              type="button"
              className="symdraw-tool"
              aria-label="Fewer copies"
              disabled={settings.n <= SYMMETRY.min}
              onClick={() => setSettings({ n: Math.max(SYMMETRY.min, settings.n - 1) })}
            >
              <MinusIcon />
            </button>
            <output className="symdraw-tools__count num" aria-live="polite">
              <span className="sr-only">Symmetry: </span>
              {settings.n}
              <span className="sr-only">-fold</span>
            </output>
            <button
              type="button"
              className="symdraw-tool"
              aria-label="More copies"
              disabled={settings.n >= SYMMETRY.max}
              onClick={() => setSettings({ n: Math.min(SYMMETRY.max, settings.n + 1) })}
            >
              <PlusIcon />
            </button>
          </div>

          <div className="symdraw-tools__group" role="group" aria-label="Brush size">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                className="symdraw-tool symdraw-size"
                aria-label={s.label}
                aria-pressed={settings.size === s.id}
                onClick={() => setSettings({ size: s.id })}
              >
                <span className="symdraw-size__dot" style={{ '--size': `${Math.min(s.px, 12)}px` }} />
              </button>
            ))}
          </div>

          <div className="symdraw-tools__group" role="group" aria-label="Actions">
            <button
              type="button"
              className="symdraw-tool"
              aria-label="Mirror"
              aria-pressed={settings.mirror}
              onClick={() => setSettings({ mirror: !settings.mirror })}
            >
              <MirrorIcon />
            </button>
            <button type="button" className="symdraw-tool" aria-label="Undo" disabled={!canUndo} onClick={undo}>
              <UndoIcon />
            </button>
            <button
              type="button"
              className="symdraw-tool"
              aria-label="Clear"
              disabled={!strokes.length}
              onClick={clear}
            >
              <ClearIcon />
            </button>
            <button
              type="button"
              className="symdraw-tool"
              aria-label="Save as PNG"
              disabled={!strokes.length}
              onClick={save}
            >
              <SaveIcon />
            </button>
          </div>
        </div>

        <button type="button" className="symdraw-tool symdraw-panel__close" aria-label="Close drawing" onClick={close}>
          <CloseIcon />
        </button>

        <p className="sr-only" role="status">
          {status}
        </p>
      </div>
    </div>,
    document.body,
  )
}
