import { TRACKS, trackIndexFor } from '../data/tracks'

/* Shared by the player bar, the tracklist and browser back/forward, so
   every page switch agrees on two things:

   1. Direction — written to <html data-track-dir> before navigating, and
      read by CSS: "next" slides content left, "prev" slides it right.
   2. Where we're heading — a switch takes a frame or two to land (view
      transition), so rapid prev/next presses step from the last track
      requested, not the page still on screen. */

const PENDING_MS = 1200

let headingTo = null
let pendingTimer = 0
let currentPath = null

function setDirection(direction) {
  document.documentElement.dataset.trackDir = direction
}

function remember(path) {
  headingTo = path
  window.clearTimeout(pendingTimer)
  pendingTimer = window.setTimeout(() => {
    headingTo = null
  }, PENDING_MS)
}

/* Called by the layout whenever a page actually lands. */
export function trackLanded(path) {
  currentPath = path
  if (headingTo === path) headingTo = null
}

export function directionBetween(fromPath, toPath) {
  const from = trackIndexFor(fromPath)
  const to = trackIndexFor(toPath)
  if (from < 0 || to < 0) return 'next'
  return to >= from ? 'next' : 'prev'
}

/* Prev/next from the player bar. Wrapping keeps its own direction:
   "next" from the last track still slides like next. */
export function stepTrack(navigate, pathname, step) {
  const count = TRACKS.length
  const from = Math.max(0, trackIndexFor(headingTo ?? pathname))
  const target = TRACKS[(from + step + count) % count]
  setDirection(step > 0 ? 'next' : 'prev')
  remember(target.path)
  navigate(target.path, { viewTransition: true })
}

/* A tracklist row: direction from its position relative to where we are
   (or are heading). The row's own link performs the navigation. */
export function prepareTrackClick(pathname, targetPath) {
  setDirection(directionBetween(headingTo ?? pathname, targetPath))
  remember(targetPath)
}

/* Browser back/forward: pick the direction from where we were. */
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (currentPath) setDirection(directionBetween(currentPath, window.location.pathname))
    headingTo = null
  })
}
