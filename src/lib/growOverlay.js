/* Overlays that grow out of the card that opened them and shrink back
   into it (the drawing toy, the work gallery): the panel's clip starts
   as the card's outline and opens to the whole panel. */

export const OVERLAY_RADIUS = 22 // matches --r-lg, the cards' corner

/* Clip insets that frame `inner` (the card) inside `outer` (the panel). */
export function insetsBetween(outer, inner, radius = OVERLAY_RADIUS) {
  const top = Math.max(0, inner.top - outer.top)
  const right = Math.max(0, outer.right - inner.right)
  const bottom = Math.max(0, outer.bottom - inner.bottom)
  const left = Math.max(0, inner.left - outer.left)
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`
}

export const fullInset = (radius = OVERLAY_RADIUS) => `inset(0px 0px 0px 0px round ${radius}px)`
