import { useState } from 'react'

/* The blob's position, size and mood live in one mutable store, and a
   single writer (the rAF loop in Blob.jsx) is the only thing that touches
   the DOM. Scroll docking is just the first *input* to that pipe.

   Later steps (drag, keyboard, hop-to-section) claim `control` and push
   their own targets through the same setters, so nothing about the blob's
   placement is hardcoded in CSS or owned by the scroll handler.

   Built in a useState initializer so it is created exactly once per mount
   without reading a ref during render. */

export const DOCK_SCALE = 0.44

function createStore() {
  const state = {
    pos: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    scale: 1,
    targetScale: 1,
    mood: 'idle',
    control: 'scroll',
    placed: false,
  }

  return {
    state,
    setTarget(x, y) {
      state.target.x = x
      state.target.y = y
    },
    setScale(value) {
      state.targetScale = value
    },
    snapToTarget() {
      state.pos.x = state.target.x
      state.pos.y = state.target.y
      state.scale = state.targetScale
      state.placed = true
    },
    setMood(mood) {
      state.mood = mood
    },
    takeControl(owner) {
      state.control = owner
    },
    releaseControl() {
      state.control = 'scroll'
    },
    hasControl(owner) {
      return state.control === owner
    },
  }
}

export default function useBlobState() {
  const [store] = useState(createStore)
  return store
}
