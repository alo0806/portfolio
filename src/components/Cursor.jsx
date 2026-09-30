import { useEffect, useRef } from 'react'
import useFinePointer from '../hooks/useFinePointer'
import useReducedMotion from '../hooks/useReducedMotion'
import { readToken } from '../lib/tokens'
import './Cursor.css'

const RING_EASE = 0.2

const TEXT_FIELDS =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select, [contenteditable="true"]'
const INTERACTIVE = 'a, button, [role="button"], label, summary'

/* A dot that sits on the pointer and a soft ring that trails it.
   Mouse/trackpad only: touch devices and reduced motion keep the native
   cursor. Over text fields the custom cursor steps aside so the native
   I-beam shows.

   Appearance is switched by one token, --cursor-mode (tokens.css). The
   cursor also reports which surface it's over (data-surface="dark" on an
   ancestor) so a themed mode can recolor per background.

   Modal dialogs (the resume box) render in the browser's top layer,
   above any z-index. So the cursor lives in the top layer too, as a
   manual popover, and steps back on top whenever a dialog opens. */

export default function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  const rootRef = useRef(null)
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!enabled || !root || !dot || !ring) return undefined

    const html = document.documentElement
    html.classList.add('has-custom-cursor')
    root.dataset.mode = readToken('--cursor-mode') || 'blend'

    // Top layer: shown now, and re-shown after any dialog opens, since
    // whatever entered the top layer last is drawn on top.
    const topLayer = typeof root.showPopover === 'function'
    const raise = () => {
      if (!topLayer) return
      try {
        if (root.matches(':popover-open')) root.hidePopover()
        root.showPopover()
      } catch {
        // Not in the document (unmounting); nothing to raise.
      }
    }
    raise()
    const dialogs = new MutationObserver((changes) => {
      if (changes.some((change) => change.target.localName === 'dialog' && change.target.open)) raise()
    })
    dialogs.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true })

    let x = -100
    let y = -100
    let rx = x
    let ry = y
    let frame = 0

    const onMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        return
      }
      x = event.clientX
      y = event.clientY
      if (root.dataset.visible !== 'true') {
        rx = x
        ry = y
        root.dataset.visible = 'true'
      }
    }

    const onOver = (event) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return
      if (target.closest(TEXT_FIELDS)) root.dataset.state = 'text'
      else if (target.closest(INTERACTIVE)) root.dataset.state = 'pointer'
      else root.dataset.state = 'default'
      root.dataset.surface = target.closest('[data-surface]')?.dataset.surface ?? 'light'
    }

    const onDown = () => {
      root.dataset.pressed = 'true'
    }
    const onUp = () => {
      root.dataset.pressed = 'false'
    }
    const onLeave = () => {
      root.dataset.visible = 'false'
    }

    const loop = () => {
      rx += (x - rx) * RING_EASE
      ry += (y - ry) * RING_EASE
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      dialogs.disconnect()
      html.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      className="cursor"
      ref={rootRef}
      popover="manual"
      data-visible="false"
      data-state="default"
      data-pressed="false"
      data-surface="light"
      aria-hidden="true"
    >
      <div className="cursor__ring" ref={ringRef}>
        <span className="cursor__ring-shape" />
      </div>
      <div className="cursor__dot" ref={dotRef}>
        <span className="cursor__dot-shape" />
      </div>
    </div>
  )
}
