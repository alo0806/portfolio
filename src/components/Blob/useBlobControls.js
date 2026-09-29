import { useEffect, useRef } from 'react'

const KEYS = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
}

const INTERACTIVE =
  'a, button, input, textarea, select, label, summary, [role="button"], [tabindex]'

const normalizeKey = (key) => (key.length === 1 ? key.toLowerCase() : key)

const isEditable = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

/* Everything a person can do to the blob. Each handler only sets a target
   or claims control on the store; the rAF loop in Blob.jsx does the rest.
   Arrow keys are only swallowed while the blob is being steered, so page
   scrolling is never hijacked otherwise. */

export default function useBlobControls({
  blob,
  handleRef,
  enabled,
  setSteering,
}) {
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)
  const lastPointerTypeRef = useRef('mouse')

  /* Keyboard steering, and letting go. */
  useEffect(() => {
    if (!enabled) return undefined

    const held = new Set()

    const sync = () => {
      let x = 0
      let y = 0
      held.forEach((key) => {
        x += KEYS[key][0]
        y += KEYS[key][1]
      })
      blob.setKeys(Math.sign(x), Math.sign(y))
    }

    const letGo = () => {
      held.clear()
      blob.releaseControl()
      setSteering(false)
    }

    const onKeyDown = (event) => {
      if (!blob.hasControl('keyboard') || isEditable(event.target)) return
      if (event.key === 'Escape') {
        event.preventDefault()
        letGo()
        return
      }
      const key = normalizeKey(event.key)
      if (!KEYS[key] || event.metaKey || event.ctrlKey || event.altKey) return
      event.preventDefault()
      held.add(key)
      sync()
    }

    const onKeyUp = (event) => {
      if (held.delete(normalizeKey(event.key))) sync()
    }

    const onBlur = () => {
      held.clear()
      sync()
    }

    const onPointerDownElsewhere = (event) => {
      if (!blob.hasControl('keyboard')) return
      if (handleRef.current?.contains(event.target)) return
      letGo()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pointerdown', onPointerDownElsewhere)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pointerdown', onPointerDownElsewhere)
    }
  }, [blob, enabled, handleRef, setSteering])

  /* Touch: a quick tap on empty space sends the blob there. Taps on links
     and buttons, and anything that turns into a scroll, are left alone. */
  useEffect(() => {
    if (!enabled) return undefined

    let start = null

    const onDown = (event) => {
      if (event.pointerType !== 'touch') return
      start = {
        x: event.clientX,
        y: event.clientY,
        at: performance.now(),
        target: event.target,
      }
    }

    const onUp = (event) => {
      if (event.pointerType !== 'touch' || !start) return
      const tap = start
      start = null
      if (Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 10) return
      if (performance.now() - tap.at > 350) return
      if (tap.target instanceof Element && tap.target.closest(INTERACTIVE)) return
      if (handleRef.current?.contains(tap.target)) return
      blob.setFree(event.clientX, event.clientY)
    }

    const onCancel = () => {
      start = null
    }

    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onCancel, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [blob, enabled, handleRef])

  /* Handlers for the blob's own hit area: drag it, or click to steer. */
  const onPointerDown = (event) => {
    if (!enabled || event.button > 0) return
    lastPointerTypeRef.current = event.pointerType
    const head = blob.getPosition()
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: head.x - event.clientX,
      offsetY: head.y - event.clientY,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return

    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5
    ) {
      drag.moved = true
      if (blob.hasControl('keyboard')) setSteering(false)
      blob.takeControl('drag')
      blob.setMood('held')
    }

    if (drag.moved) {
      blob.setTarget(event.clientX + drag.offsetX, event.clientY + drag.offsetY)
    }
  }

  const onPointerUp = (event) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    dragRef.current = null
    if (!drag.moved) return
    // Dropped: it stays where you left it until the next chapter calls.
    blob.setFree(blob.state.target.x, blob.state.target.y)
    blob.setMood('idle')
    suppressClickRef.current = true
  }

  const onClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    // A finger has no arrow keys; a tap on the blob is just a hello.
    if (lastPointerTypeRef.current === 'touch') {
      lastPointerTypeRef.current = 'mouse'
      blob.setMood('happy')
      return
    }
    if (blob.hasControl('keyboard')) {
      blob.releaseControl()
      setSteering(false)
    } else {
      blob.takeControl('keyboard')
      setSteering(true)
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp, onClick }
}
