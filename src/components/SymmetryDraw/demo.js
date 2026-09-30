/* The collapsed card's looping demo: a few pre-scripted strokes, traced
   one after another with 12-fold symmetry, like someone doodling. Points
   are in the same centre-relative units as real strokes (see engine.js). */

function curve(steps, fn) {
  return Array.from({ length: steps + 1 }, (_, i) => fn(i / steps))
}

const polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)]

export const DEMO_STROKES = [
  // A long sweep from near the centre out to the rim.
  {
    color: '--accent',
    width: 0.018,
    n: 12,
    mirror: true,
    points: curve(48, (t) => polar(0.14 + 0.72 * t, 0.32 * Math.sin(Math.PI * t))),
  },
  // A petal loop halfway out.
  {
    color: '--cover-plum-b',
    width: 0.014,
    n: 12,
    mirror: false,
    points: curve(56, (t) => {
      const a = Math.PI * 2 * t
      return [0.46 + 0.16 * Math.cos(a), 0.07 * Math.sin(a)]
    }),
  },
  // A wavy ring near the edge.
  {
    color: '--cover-mint-a',
    width: 0.012,
    n: 12,
    mirror: true,
    points: curve(40, (t) => polar(0.78 + 0.035 * Math.sin(Math.PI * 6 * t), -0.26 + 0.52 * t)),
  },
  // Small off-white dots of light between the petals.
  {
    color: '--on-indigo',
    width: 0.022,
    n: 12,
    mirror: false,
    points: curve(10, (t) => polar(0.3 + 0.02 * Math.sin(Math.PI * 2 * t), 0.26 + 0.03 * t)),
  },
]

// Timing, in seconds.
export const DEMO_TIMING = {
  perStroke: 1.8, // drawing one stroke
  hold: 1.6, // admiring the finished pattern
  fade: 0.9, // fading out before it starts again
}

export const DEMO_LENGTH =
  DEMO_STROKES.length * DEMO_TIMING.perStroke + DEMO_TIMING.hold + DEMO_TIMING.fade
