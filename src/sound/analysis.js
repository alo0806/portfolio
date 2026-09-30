import { SOUND } from './config'
import { isAudible, onSoundChange } from './engine'
import { getAnalyser, isSounding, subscribeMusic } from './music'

/* Turns the music into motion. While a song is audibly playing, one
   animation-frame loop reads the analyser and hands every subscriber a
   frame of smoothed values (all 0–1, except sway, −1–1):

     bass / mids / highs — three bands, fast up, slower down
     pulse — jumps to 1 on a bass hit, then fades
     level — overall loudness, slow
     sway — a gentle side-to-side, as wide as the level

   Subscribers write these straight onto their own elements (no React
   re-renders). When nothing is audible — paused, muted, tab hidden, no
   analyser — the loop stops, subscribers get `null`, and
   <html data-reactive> goes back to "false" so CSS returns everything to
   its idle animation. Under prefers-reduced-motion the bands move slowly
   and there's no pulse or sway. */

const A = SOUND.analysis
const subscribers = new Set()
const reducedQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

const frame = { bass: 0, mids: 0, highs: 0, pulse: 0, level: 0, sway: 0 }
let raf = 0
let last = 0
let data = null
let ranges = null
let bassAverage = 0
let lastBeat = -Infinity
let phase = 0
let reactive = false

export function onAudioFrame(listener) {
  subscribers.add(listener)
  kick()
  return () => subscribers.delete(listener)
}

function canRun() {
  return subscribers.size > 0 && !document.hidden && isAudible() && isSounding() && getAnalyser()
}

/* Something changed (music, mute, volume, visibility): start the loop,
   or stop it right away and put everything back to idle. */
function kick() {
  if (typeof window === 'undefined') return
  if (!canRun()) {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    rest()
    return
  }
  if (raf) return
  last = performance.now()
  raf = requestAnimationFrame(tick)
}

function rest() {
  if (!reactive) return
  reactive = false
  document.documentElement.dataset.reactive = 'false'
  Object.keys(frame).forEach((key) => {
    frame[key] = 0
  })
  bassAverage = 0
  subscribers.forEach((listener) => listener(null))
}

function bandRanges(analyser) {
  const binHz = analyser.context.sampleRate / analyser.fftSize
  const toRange = ([low, high]) => [
    Math.max(1, Math.floor(low / binHz)),
    Math.min(analyser.frequencyBinCount - 1, Math.ceil(high / binHz)),
  ]
  return {
    bass: toRange(A.bands.bass),
    mids: toRange(A.bands.mids),
    highs: toRange(A.bands.highs),
  }
}

function average([from, to]) {
  let sum = 0
  for (let i = from; i <= to; i += 1) sum += data[i]
  return sum / ((to - from + 1) * 255)
}

// Frame-rate independent easing toward a target.
function approach(current, target, rate, dt) {
  return current + (target - current) * (1 - Math.exp(-rate * dt))
}

function tick(now) {
  raf = 0
  if (!canRun()) {
    rest()
    return
  }
  const analyser = getAnalyser()
  if (!data || data.length !== analyser.frequencyBinCount) {
    data = new Uint8Array(analyser.frequencyBinCount)
    ranges = bandRanges(analyser)
  }
  analyser.getByteFrequencyData(data)

  const dt = Math.min((now - last) / 1000, 0.1)
  last = now
  const reduced = reducedQuery?.matches
  const raw = {
    bass: Math.min(1, average(ranges.bass) * A.gain.bass),
    mids: Math.min(1, average(ranges.mids) * A.gain.mids),
    highs: Math.min(1, average(ranges.highs) * A.gain.highs),
  }

  for (const band of ['bass', 'mids', 'highs']) {
    const rising = raw[band] > frame[band]
    const rate = reduced ? A.reducedRate : rising ? A.attack : A.release
    frame[band] = approach(frame[band], raw[band], rate, dt)
  }

  // Beat: bass jumping well above its own recent average.
  const beat = A.beat
  bassAverage = approach(bassAverage, raw.bass, 1 / beat.window, dt)
  const seconds = now / 1000
  if (
    raw.bass > beat.floor &&
    raw.bass > bassAverage * beat.threshold &&
    seconds - lastBeat > beat.cooldown
  ) {
    lastBeat = seconds
    frame.pulse = 1
  } else {
    frame.pulse *= Math.exp(-dt / beat.decay)
  }

  const loudness = (raw.bass + raw.mids + raw.highs) / 3
  frame.level = approach(frame.level, loudness, 2, dt)
  phase += dt * 1.3
  frame.sway = Math.sin(phase) * Math.min(1, frame.level * 1.6)

  if (reduced) {
    frame.pulse = 0
    frame.sway = 0
  }

  if (!reactive) {
    reactive = true
    document.documentElement.dataset.reactive = 'true'
  }
  subscribers.forEach((listener) => listener(frame))
  raf = requestAnimationFrame(tick)
}

if (typeof window !== 'undefined') {
  subscribeMusic(kick)
  onSoundChange(kick)
  document.addEventListener('visibilitychange', kick)
}
