import { useEffect, useRef } from 'react'

/* Pointer position is held in a ref, never state — the blob reads it once
   per animation frame, and putting it in state would re-render on every
   mouse move. Touch devices have no hover cursor, so we record the last
   touch point and let the caller decide when it has gone stale. */

export default function usePointer() {
  const pointer = useRef({ x: 0, y: 0, active: false, touch: false, at: 0 })

  useEffect(() => {
    const write = (x, y, touch) => {
      const p = pointer.current
      p.x = x
      p.y = y
      p.active = true
      p.touch = touch
      p.at = performance.now()
    }

    const onPointerMove = (event) => {
      if (event.pointerType === 'touch') return
      write(event.clientX, event.clientY, false)
    }

    const onTouch = (event) => {
      const touch = event.touches?.[0]
      if (touch) write(touch.clientX, touch.clientY, true)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return pointer
}
