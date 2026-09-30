/* Reads a token from tokens.css so timings and switches stay in the
   stylesheet rather than being hardcoded in JS. */

export function readToken(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

export function readNumberToken(name, fallback) {
  const value = parseFloat(readToken(name))
  return Number.isFinite(value) ? value : fallback
}
