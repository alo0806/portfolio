/* The blob's position, size and mood live in one mutable store. A single
   writer (the rAF loop in Blob.jsx) is the only thing that touches the
   DOM; everything else — scroll, cursor, drag, keys, taps, the intro —
   is an input that sets a target or claims control.

   control:
     follow    leashed to its chapter's home, leaning toward the cursor
     drag      held by the pointer
     keyboard  steered with arrow keys / WASD until Escape
     free      dropped or tapped somewhere; stays until the next chapter
     static    prefers-reduced-motion: sits at home, no physics */

export function createBlobStore() {
  const state = {
    head: { x: 0, y: 0, vx: 0, vy: 0 },
    trail: [],
    target: { x: 0, y: 0 },
    home: { x: 0, y: 0 },
    free: null, // page-anchored point: { x, pageY }
    keys: { x: 0, y: 0 },
    control: 'follow',
    mood: 'idle',
    moodAt: 0,
    placed: false,
  }

  return {
    state,
    /* Drop the whole mass at a point with no momentum (first frame). */
    place(x, y) {
      state.head = { x, y, vx: 0, vy: 0 }
      state.trail = state.trail.map(() => ({ x, y, vx: 0, vy: 0 }))
      state.placed = true
    },
    /* Match the trail to the circle count for this breakpoint. */
    resizeTrail(length) {
      state.trail = Array.from(
        { length },
        (_, i) =>
          state.trail[i] ?? { x: state.head.x, y: state.head.y, vx: 0, vy: 0 },
      )
    },
    setHome(x, y) {
      state.home.x = x
      state.home.y = y
    },
    setTarget(x, y) {
      state.target.x = x
      state.target.y = y
    },
    setFree(x, y) {
      state.free = { x, pageY: y + window.scrollY }
      state.control = 'free'
    },
    setKeys(x, y) {
      state.keys.x = x
      state.keys.y = y
    },
    getPosition() {
      return { x: state.head.x, y: state.head.y }
    },
    setMood(mood) {
      state.mood = mood
      state.moodAt = performance.now()
    },
    takeControl(owner) {
      if (owner === 'keyboard' || owner === 'drag') {
        state.target.x = state.head.x
        state.target.y = state.head.y
      }
      state.control = owner
    },
    releaseControl() {
      state.control = 'follow'
      state.free = null
      state.keys.x = 0
      state.keys.y = 0
    },
    hasControl(owner) {
      return state.control === owner
    },
  }
}
