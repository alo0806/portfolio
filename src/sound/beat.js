import { readNumberToken } from '../lib/tokens'
import { getMusic, getMusicMix, subscribeMusic } from './music'

/* A small beat tracker for the background music.

   An analyser listens to the music mix (before the volume slider, so it
   works while muted) about 30 times a second — only while something has
   asked for the beat (acquire) and music is actually playing, and never
   in a hidden tab. Each reading becomes an "onset strength": how much the
   spectrum just jumped, weighted toward the bass, where the kick lives.

   Every half second the last 8 seconds of onsets are searched for the
   tempo (autocorrelation between 70 and 170 bpm, nudged toward ~100) and
   for where the beats fall. A new tempo has to win several times running
   before it's believed. That drives a beat clock that never jumps: each
   estimate only speeds it up or slows it down a touch until it lines up. Until it has locked onto a song it runs at the site's own tempo
   (--beat in tokens.css).

   beat.acquire()   start listening; returns release()
   beat.at(time?)   { beat, bpm, locked } — beat is a running count of
                    beats (fractional), e.g. 12.5 = halfway through the
                    13th; time is performance.now() time */

const RATE = 30 // readings per second
const WINDOW = 8 // seconds of history
const MIN_BPM = 70
const MAX_BPM = 170
const PRIOR_BPM = 100 // tempo guesses lean toward this (the playlist is lo-fi, ~75–100)
const SAME_TEMPO = 0.06 // readings within 6% are the same tempo
const SWITCH_AFTER = 4 // a new tempo must win this many estimates in a row
const CORRECT_MS = 500 // each phase correction lasts this long
const DETECT_LAG = 40 // ms: an onset shows up in the readings about this late
const ESTIMATE_EVERY = 15 // readings (half a second)
const MIN_HISTORY = 4 // seconds before the first estimate
const LOCK_SCORE = 1.6 // how clearly the tempo must stand out

const size = RATE * WINDOW
const onsets = new Float32Array(size)
const times = new Float64Array(size)
let count = 0 // readings so far for this song
let head = 0 // ring position of the next reading

let analyser = null
let bins = null
let previous = null
let average = 0
let timer = 0
let users = 0
let songIndex = -1

let clock = { t0: 0, b0: 0, period: 520, rate: 1 } // period in ms
let locked = false
let lockedBpm = 0
let candidate = 0
let candidateRuns = 0

let fallback = 0
const fallbackPeriod = () => fallback || (fallback = readNumberToken('--beat', 0.52))

/* The clock runs at its period, except for a short correction: `rate`
   applies for CORRECT_MS after each re-anchor, then it's back to 1 — so a
   correction can't keep drifting if the next estimate doesn't come. */
function beatAt(t) {
  const corrected = Math.min(t, clock.t0 + CORRECT_MS)
  return clock.b0 + ((corrected - clock.t0) * clock.rate + Math.max(0, t - corrected)) / clock.period
}

// Re-anchor the clock at `t` (no jump), with a new period and correction.
function setClock(t, period, rate = 1) {
  clock = { t0: t, b0: beatAt(t), period: period * 1000, rate }
}

function reset() {
  count = 0
  head = 0
  previous = null
  average = 0
  if (locked) setClock(performance.now(), fallbackPeriod())
  locked = false
  lockedBpm = 0
  candidate = 0
}

function ensureAnalyser() {
  if (analyser) return true
  const mix = getMusicMix()
  if (!mix) return false
  analyser = mix.ctx.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0
  mix.node.connect(analyser)
  bins = new Uint8Array(analyser.frequencyBinCount)
  return true
}

/* One reading: spectral flux up to ~2.5 kHz, the lowest bins (≲190 Hz,
   the kick) counted three times, minus its own running average. */
function read() {
  if (!ensureAnalyser()) return
  analyser.getByteFrequencyData(bins)
  const hzPerBin = analyser.context.sampleRate / analyser.fftSize
  const top = Math.min(bins.length, Math.round(2500 / hzPerBin))
  const bass = Math.round(190 / hzPerBin)
  let flux = 0
  if (previous) {
    for (let i = 1; i < top; i += 1) {
      const rise = bins[i] - previous[i]
      if (rise > 0) flux += i <= bass ? rise * 3 : rise
    }
  } else {
    previous = new Uint8Array(bins.length)
  }
  previous.set(bins)
  average += (flux - average) * 0.1
  const latency = (analyser.context.outputLatency || 0) + (analyser.context.baseLatency || 0)
  onsets[head] = Math.max(0, flux - average)
  times[head] = performance.now() + latency * 1000
  head = (head + 1) % size
  count += 1
  if (count >= RATE * MIN_HISTORY && count % ESTIMATE_EVERY === 0) estimate()
}

// The i-th most recent reading (0 = newest).
const recent = (i) => onsets[(head - 1 - i + size * 2) % size]
const recentTime = (i) => times[(head - 1 - i + size * 2) % size]

function estimate() {
  const n = Math.min(count, size)
  const span = (recentTime(0) - recentTime(n - 1)) / 1000
  if (span <= 0) return
  const rate = (n - 1) / span // actual readings per second

  // Tempo: autocorrelation over the lags of 70–170 bpm, with a gentle
  // preference for tempos near 100 (so half/double-time guesses lose).
  const minLag = Math.floor((rate * 60) / MAX_BPM)
  const maxLag = Math.ceil((rate * 60) / MIN_BPM)
  const scores = []
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0
    for (let i = 0; i + lag < n; i += 1) sum += recent(i) * recent(i + lag)
    const bpm = (rate * 60) / lag
    const prior = Math.exp(-0.5 * (Math.log2(bpm / PRIOR_BPM) / 0.6) ** 2)
    scores.push((sum / (n - lag)) * prior)
  }
  let best = 0
  for (let i = 1; i < scores.length; i += 1) if (scores[i] > scores[best]) best = i
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const spread = Math.sqrt(scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length) || 1
  const clarity = (scores[best] - mean) / spread
  if (clarity < LOCK_SCORE || best === 0 || best === scores.length - 1) return

  // Between whole lags: fit a parabola through the peak and its neighbours.
  const [a, b, c] = [scores[best - 1], scores[best], scores[best + 1]]
  const shift = a - 2 * b + c === 0 ? 0 : (0.5 * (a - c)) / (a - 2 * b + c)
  const measured = (rate * 60) / (minLag + best + shift)

  // Hold on to the tempo: close readings refine it; a different one has
  // to win several times running (swung drums often hint at a 4:3 or 2:1
  // tempo for a moment) before the beat clock follows it.
  const now = performance.now()
  if (!locked) {
    lockedBpm = measured
  } else if (Math.abs(measured - lockedBpm) / lockedBpm < SAME_TEMPO) {
    lockedBpm = lockedBpm * 0.8 + measured * 0.2
    candidate = 0
  } else {
    if (candidate && Math.abs(measured - candidate) / candidate < SAME_TEMPO) candidateRuns += 1
    else {
      candidate = measured
      candidateRuns = 1
    }
    if (candidateRuns < SWITCH_AFTER) return
    lockedBpm = candidate
    candidate = 0
  }
  const period = 60 / lockedBpm

  // Phase: where a comb of beats at that period lines up best with the
  // onsets (searched in quarter-reading steps).
  const perBeat = period * rate
  const at = (x) => {
    const i = Math.floor(x)
    return i + 1 >= n ? 0 : recent(i) + (recent(i + 1) - recent(i)) * (x - i)
  }
  let bestOffset = 0
  let bestScore = -1
  for (let offset = 0; offset < perBeat; offset += 0.25) {
    let score = 0
    for (let x = offset; x < n - 1; x += perBeat) score += at(x)
    if (score > bestScore) {
      bestScore = score
      bestOffset = offset
    }
  }
  const lastBeat = recentTime(0) - (bestOffset / rate) * 1000 - DETECT_LAG

  if (!locked) setClock(now, period)
  locked = true

  // How far the clock is from that; then speed up or slow down a touch
  // (never jump) to close the gap. Each estimate already looks at the
  // last 8 seconds, so one messy bar can't throw it.
  const target = (now - lastBeat) / 1000 / period
  const phaseError = wrap(target - beatAt(now))
  // (Closing the whole gap over one correction would overshoot on a noisy
  // reading; this closes about half of it.)
  const perCorrection = CORRECT_MS / 1000 / period // beats in one correction
  setClock(now, period, Math.min(1.25, Math.max(0.75, 1 + (phaseError * 0.5) / perCorrection)))
}

// A phase difference folded into -0.5…0.5 beats.
function wrap(x) {
  return x - Math.round(x)
}

function running() {
  return users > 0 && getMusic().playing && !document.hidden
}

function sync() {
  if (running() && !timer) {
    timer = window.setInterval(read, 1000 / RATE)
  } else if (!running() && timer) {
    window.clearInterval(timer)
    timer = 0
    previous = null
  }
}

if (typeof window !== 'undefined') {
  clock = { t0: performance.now(), b0: 0, period: fallbackPeriod() * 1000, rate: 1 }
  subscribeMusic(() => {
    const { index } = getMusic()
    if (index !== songIndex) {
      songIndex = index
      reset()
    }
    sync()
  })
  document.addEventListener('visibilitychange', sync)
}

export const beat = {
  acquire() {
    users += 1
    sync()
    let released = false
    return () => {
      if (released) return
      released = true
      users -= 1
      sync()
    }
  },

  at(time = performance.now()) {
    return { beat: beatAt(time), bpm: locked ? lockedBpm : 60 / fallbackPeriod(), locked }
  },
}
