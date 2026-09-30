import { readToken } from './tokens'

/* The motion tokens, for Web Animations in JS. Read at call time so a
   change in tokens.css is the only change ever needed. */

export function ease(name) {
  return readToken(`--ease-${name}`) || 'ease'
}

export function duration(name) {
  const raw = readToken(`--dur-${name}`)
  const value = parseFloat(raw)
  return Number.isFinite(value) ? value : 300
}

export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/* Cancels every running animation on an element (and optionally a
   pseudo-element) so a new one never stacks on top of an old one. */
export function cancelAnimations(el) {
  el?.getAnimations?.().forEach((animation) => animation.cancel())
}
