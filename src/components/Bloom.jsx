import { useEffect, useRef } from 'react'
import { CHAPTER_IDS } from '../chapters'
import { useEarned } from '../context/sectionContexts'
import useReducedMotion from '../hooks/useReducedMotion'
import { readToken } from '../lib/tokens'
import { useBlob } from './Blob/blobContext'
import './Bloom.css'

/* The first time a chapter is reached, its color spreads across the
   screen from the blob like pigment dropped into wet paper, then recedes
   into the chapter's own settled wash.

   The watercolor edge (turbulence + displacement) is baked into a static
   mask image, so the only thing animating is transform and opacity on a
   composited layer — no SVG filter is re-run per frame, on any device.
   Blooms are fire-and-forget DOM nodes and never touch React state. */

const VISIBLE_RADIUS = 0.3 // share of the layer covered by the mask's disc

export default function Bloom() {
  const earned = useEarned()
  const blob = useBlob()
  const reduced = useReducedMotion()
  const layerRef = useRef(null)
  const seenRef = useRef(new Set())

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const fresh = earned.filter((id) => !seenRef.current.has(id))
    fresh.forEach((id) => seenRef.current.add(id))
    if (reduced) return

    fresh
      .filter((id) => CHAPTER_IDS.includes(id))
      .forEach((id, order) => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const origin = blob.getPosition()
        const x = Math.min(vw, Math.max(0, origin.x))
        const y = Math.min(vh, Math.max(0, origin.y))

        const size = readToken('--bloom-size', 640)
        const duration = readToken('--bloom-duration', 2400)
        const peak = readToken('--bloom-peak', 0.55)
        const cover = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y))
        const endScale = cover / (size * VISIBLE_RADIUS)
        const turn = Math.random() * 360

        const el = document.createElement('div')
        el.className = 'bloom'
        el.dataset.chapter = id
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.left = `${x}px`
        el.style.top = `${y}px`
        layer.appendChild(el)

        const at = (scale, spin) =>
          `translate(-50%, -50%) rotate(${turn + spin}deg) scale(${scale})`

        el.animate(
          [
            { transform: at(0.04, 0), opacity: 0, offset: 0 },
            { opacity: peak, offset: 0.12 },
            { transform: at(endScale, 10), opacity: peak, offset: 0.6 },
            { transform: at(endScale * 1.06, 14), opacity: 0, offset: 1 },
          ],
          {
            duration,
            delay: order * 260,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both',
          },
        ).finished.then(
          () => el.remove(),
          () => el.remove(),
        )
      })
  }, [earned, blob, reduced])

  return <div className="bloom-layer" ref={layerRef} aria-hidden="true" />
}
