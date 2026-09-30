import { useSyncExternalStore } from 'react'
import { SOUND } from './config'

/* Sound effects are synthesized with the Web Audio API — no files. The
   background music (real files, see music.js) shares this graph.

   Ground rules, enforced here so no call site has to remember them:
   - On by default; muting is remembered for the session, the volume
     slider's level across visits. Muting turns the output down rather
     than stopping anything, so a song keeps its place while muted.
   - The AudioContext is created only after a user gesture (browsers
     require it anyway).
   - Nothing plays while the tab is hidden.
   - Each sound has a minimum interval (config throttle), so rapid
     hovering or clicking can't pile up.

   The graph: sound effects → sfx bus (level + low-pass) ─┐
              background music → music bus (level) ───────┴→ volume → out
   so the one slider sets both. */

const SOUND_KEY = 'astnlo:sound'
const VOLUME_KEY = 'astnlo:volume'
const NOTE_INDEX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }

let ctx = null
let output = null
let sfxBus = null
let musicBus = null
let noiseBuffer = null
let crackleBuffer = null
let enabled = readEnabled()
let volume = readVolume()
const listeners = new Set()
const lastPlayed = new Map()

function readEnabled() {
  try {
    return window.sessionStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

function readVolume() {
  try {
    const stored = Number.parseFloat(window.localStorage.getItem(VOLUME_KEY))
    if (Number.isFinite(stored)) return Math.min(1, Math.max(0, stored))
  } catch {
    // Fall through to the default.
  }
  return SOUND.volume.initial
}

function notify() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/* Mute or volume changed. */
export const onSoundChange = subscribe

/* ─── On / off ─────────────────────────────────────────────────── */

export function isSoundOn() {
  return enabled
}

export function setSoundOn(on) {
  enabled = on
  try {
    window.sessionStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    // Not remembered; harmless.
  }
  if (on) ensureContext() // called from a click, so this is a gesture
  applyOutput()
  notify()
}

export function useSoundOn() {
  return useSyncExternalStore(subscribe, isSoundOn, () => true)
}

/* ─── Volume (0–1, the slider's position) ──────────────────────── */

export function getVolume() {
  return volume
}

export function setVolume(value) {
  volume = Math.min(1, Math.max(0, value))
  try {
    window.localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {
    // Not remembered; harmless.
  }
  applyOutput()
  notify()
}

export function useVolume() {
  return useSyncExternalStore(subscribe, getVolume, () => SOUND.volume.initial)
}

function loudness(value) {
  return value ** SOUND.volume.curve
}

/* Is anything audible right now? (Muted, or the slider at zero, is not.) */
export function isAudible() {
  return enabled && volume > 0
}

// A short glide instead of a jump, so dragging or muting never clicks.
function applyOutput() {
  if (!output) return
  output.gain.setTargetAtTime(enabled ? loudness(volume) : 0, ctx.currentTime, 0.03)
}

/* ─── The audio graph ──────────────────────────────────────────── */

function ensureContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()

    output = ctx.createGain()
    output.gain.value = enabled ? loudness(volume) : 0
    output.connect(ctx.destination)

    sfxBus = ctx.createGain()
    sfxBus.gain.value = SOUND.sfx.level
    const soften = ctx.createBiquadFilter()
    soften.type = 'lowpass'
    soften.frequency.value = SOUND.sfx.lowpass
    soften.Q.value = 0.5
    sfxBus.connect(soften).connect(output)

    musicBus = ctx.createGain()
    musicBus.gain.value = SOUND.music.level
    musicBus.connect(output)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

/* For the background music: its sources connect here and follow the
   volume slider and the mute button like everything else. Call from a
   user gesture (the first time). Null if Web Audio isn't available. */
export function getMusicOutput() {
  return ensureContext() ? { ctx, bus: musicBus } : null
}

// The first click or key press brings the context up (if not muted).
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (enabled) ensureContext()
  }
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('keydown', unlock, true)
}

/* Returns the context if this sound may play right now, else null.
   `force` (the /sounds test panel) skips the on/off switch and throttle. */
function gate(name, force = false) {
  if ((!enabled || volume === 0) && !force) return null
  if (document.hidden) return null
  if (!ctx) {
    const activated = navigator.userActivation?.hasBeenActive ?? true
    if (!activated) return null
    if (!ensureContext()) return null
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  if (!force) {
    const now = performance.now()
    const min = SOUND.throttle[name] ?? 0
    if (now - (lastPlayed.get(name) ?? -Infinity) < min) return null
    lastPlayed.set(name, now)
  }
  return ctx
}

/* ─── Building blocks ──────────────────────────────────────────── */

function noteFrequency(name) {
  const match = /^([A-G]#?)(-?\d)$/.exec(name)
  const midi = (Number(match[2]) + 1) * 12 + NOTE_INDEX[match[1]]
  return 440 * 2 ** ((midi - 69) / 12)
}

/* A scale degree (any integer; wraps into higher octaves) in the key. */
export function scaleFrequency(degree, octave) {
  const { root, scale } = SOUND.key
  const steps = scale.length
  const wrapped = ((degree % steps) + steps) % steps
  const extraOctaves = Math.floor(degree / steps)
  const base = noteFrequency(`${root}${octave + extraOctaves}`)
  return base * 2 ** (scale[wrapped] / 12)
}

function getNoise() {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

/* Vinyl texture: sparse, decaying pops over a faint hiss. */
function getCrackle() {
  if (!crackleBuffer) {
    const { hiss, popsPerSecond } = SOUND.crackle
    const rate = ctx.sampleRate
    crackleBuffer = ctx.createBuffer(1, rate * 3, rate)
    const data = crackleBuffer.getChannelData(0)
    const popChance = popsPerSecond / rate
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * hiss
      if (Math.random() < popChance) {
        const amp = (Math.random() * 0.8 + 0.2) * (Math.random() < 0.5 ? -1 : 1)
        const length = 8 + Math.floor(Math.random() * 40)
        for (let j = 0; j < length && i + j < data.length; j += 1) {
          data[i + j] += amp * Math.exp(-j / (length / 4))
        }
      }
    }
  }
  return crackleBuffer
}

/* Gentle envelope: soft attack, exponential fall to silence. */
function envelope(param, start, peak, attack, decay) {
  param.setValueAtTime(0.0001, start)
  param.linearRampToValueAtTime(peak, start + attack)
  param.exponentialRampToValueAtTime(0.0001, start + attack + decay)
}

function tone(freq, { delay = 0, gain, decay, attack, type, overtone, lowpass, bendFrom }) {
  const t = ctx.currentTime + delay
  const end = t + attack + decay + 0.05

  const amp = ctx.createGain()
  envelope(amp.gain, t, gain, attack, decay)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = lowpass
  amp.connect(filter).connect(sfxBus)

  const osc = ctx.createOscillator()
  osc.type = type
  if (bendFrom) {
    osc.frequency.setValueAtTime(freq * bendFrom, t)
    osc.frequency.exponentialRampToValueAtTime(freq, t + attack + decay * 0.4)
  } else {
    osc.frequency.value = freq
  }
  osc.connect(amp)
  osc.start(t)
  osc.stop(end)

  if (overtone > 0) {
    const upper = ctx.createOscillator()
    upper.type = 'sine'
    upper.frequency.value = freq * 2
    const level = ctx.createGain()
    level.gain.value = overtone
    upper.connect(level).connect(amp)
    upper.start(t)
    upper.stop(end)
  }
}

function noiseBurst({ delay = 0, duration, gain, attack = 0.002, filters }) {
  const t = ctx.currentTime + delay
  const source = ctx.createBufferSource()
  source.buffer = getNoise()
  const amp = ctx.createGain()
  envelope(amp.gain, t, gain, attack, duration)
  let node = source
  filters.forEach(({ type, frequency, Q = 0.7 }) => {
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = frequency
    filter.Q.value = Q
    node.connect(filter)
    node = filter
  })
  node.connect(amp).connect(sfxBus)
  source.start(t, Math.random() * 1.5)
  source.stop(t + attack + duration + 0.05)
}

/* ─── The sounds ───────────────────────────────────────────────── */

function playNote(freq, { soft = false, delay = 0 } = {}) {
  const n = SOUND.note
  tone(freq, {
    delay,
    type: n.type,
    overtone: n.overtone,
    lowpass: n.lowpass,
    attack: soft ? n.attack * 2 : n.attack,
    decay: soft ? SOUND.hoverNote.decay : n.decay,
    gain: soft ? n.gain * SOUND.hoverNote.gainScale : n.gain,
  })
}

function trackFrequency(index) {
  const track = SOUND.tracks[index] ?? SOUND.tracks[0]
  return scaleFrequency(track.degree, track.octave)
}

function clickSound() {
  const c = SOUND.click
  noiseBurst({
    duration: c.noiseDuration,
    gain: c.noiseGain,
    filters: [{ type: 'bandpass', frequency: c.bandpass, Q: c.bandpassQ }],
  })
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(c.blipFrom, t)
  osc.frequency.exponentialRampToValueAtTime(c.blipTo, t + c.blipDuration)
  const amp = ctx.createGain()
  envelope(amp.gain, t, c.blipGain, 0.002, c.blipDuration)
  osc.connect(amp).connect(sfxBus)
  osc.start(t)
  osc.stop(t + c.blipDuration + 0.05)
}

export const sound = {
  /* A tracklist row's own note. soft = hover. */
  trackNote(index, { soft = false, force = false } = {}) {
    if (!gate(soft ? 'hoverNote' : 'note', force)) return
    playNote(trackFrequency(index), { soft })
  },

  /* Prev / next: a mechanical click, then the new track's note. */
  switchTrack(index, { force = false } = {}) {
    if (!gate('click', force)) return
    clickSound()
    playNote(trackFrequency(index), { delay: SOUND.click.noteDelay })
  },

  click({ force = false } = {}) {
    if (!gate('click', force)) return
    clickSound()
  },

  /* Press play: the needle lands (low thump + tiny tick). */
  needleDrop({ delay = 0, force = false } = {}) {
    if (!gate('needle', force)) return
    const n = SOUND.needle
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(n.from, t)
    osc.frequency.exponentialRampToValueAtTime(n.to, t + n.sweep)
    const amp = ctx.createGain()
    envelope(amp.gain, t, n.gain, 0.004, n.decay)
    osc.connect(amp).connect(sfxBus)
    osc.start(t)
    osc.stop(t + n.decay + 0.06)
    noiseBurst({
      delay,
      duration: 0.01,
      gain: n.tickGain,
      filters: [{ type: 'lowpass', frequency: 1400 }],
    })
  },

  /* Press play: vinyl crackle under the spin-up. */
  crackle({ delay = 0, duration = SOUND.crackle.duration, force = false } = {}) {
    if (!gate('crackle', force)) return
    const c = SOUND.crackle
    const t = ctx.currentTime + delay
    const source = ctx.createBufferSource()
    source.buffer = getCrackle()
    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = c.highpass
    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = c.lowpass
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.linearRampToValueAtTime(c.gain, t + c.fade)
    amp.gain.setValueAtTime(c.gain, t + Math.max(c.fade, duration - c.fade))
    amp.gain.linearRampToValueAtTime(0.0001, t + duration)
    source.connect(high).connect(low).connect(amp).connect(sfxBus)
    source.start(t, Math.random() * 1.5)
    source.stop(t + duration + 0.05)
  },

  /* Back to the record: a chord that slows and sinks, like a tape stop. */
  tapeStop({ force = false } = {}) {
    if (!gate('tapeStop', force)) return
    const s = SOUND.tapeStop
    const t = ctx.currentTime
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(s.lowpassFrom, t)
    filter.frequency.exponentialRampToValueAtTime(s.lowpassTo, t + s.duration)
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.linearRampToValueAtTime(s.gain, t + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + s.duration)
    filter.connect(amp).connect(sfxBus)
    s.degrees.forEach((degree, i) => {
      const freq = scaleFrequency(degree, s.octave)
      const osc = ctx.createOscillator()
      osc.type = i === 0 ? 'sawtooth' : 'triangle'
      osc.frequency.setValueAtTime(freq, t)
      osc.frequency.exponentialRampToValueAtTime(freq / s.drop, t + s.duration)
      osc.connect(filter)
      osc.start(t)
      osc.stop(t + s.duration + 0.05)
    })
  },

  /* The mascot talking: one pitched blip per word, picked from the key
     by the word itself, so the same line always "sounds" the same. */
  babble(text, { force = false } = {}) {
    if (!gate('babble', force)) return
    const b = SOUND.babble
    const words = text.split(/\s+/).filter(Boolean).slice(0, b.maxWords)
    words.forEach((word, i) => {
      const seed = [...word].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
      tone(scaleFrequency(seed % SOUND.key.scale.length, b.octave), {
        delay: i * b.gap,
        type: 'triangle',
        overtone: 0,
        lowpass: 2600,
        attack: 0.006,
        decay: b.blip,
        gain: b.gain,
        bendFrom: b.bend,
      })
    })
  },

  /* Card hover: a barely-there brush of filtered noise. */
  texture({ force = false } = {}) {
    if (!gate('texture', force)) return
    const x = SOUND.texture
    noiseBurst({
      duration: x.duration,
      gain: x.gain,
      attack: 0.012,
      filters: [{ type: 'bandpass', frequency: x.bandpass, Q: x.bandpassQ }],
    })
  },

  /* Turning sound on: a soft two-note hello. */
  /* Letting go of the volume slider: one soft note at the new level. */
  preview({ force = false } = {}) {
    if (!gate('preview', force)) return
    const p = SOUND.preview
    playNote(scaleFrequency(p.degree, p.octave))
  },

  confirm({ force = false } = {}) {
    if (!gate('note', force)) return
    const c = SOUND.confirm
    c.degrees.forEach((degree, i) =>
      playNote(scaleFrequency(degree, c.octave), { delay: i * c.spacing }),
    )
  },
}
