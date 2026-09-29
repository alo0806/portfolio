/* Reads a unitless number from tokens.css so tuning values (blob size,
   leash length, bloom timing…) stay in the stylesheet, and can differ
   per breakpoint, instead of being hardcoded in JS. */

export function readToken(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name)
  const value = parseFloat(raw)
  return Number.isFinite(value) ? value : fallback
}
