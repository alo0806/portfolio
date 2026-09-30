import { useSyncExternalStore } from 'react'
import { playlist } from '../data/content'
import { SOUND } from './config'
import { getMusicOutput } from './engine'

/* The background music: the playlist in content.js, played through the
   same audio graph as the sound effects (so the volume slider and the
   mute button cover it).

   - Lives in this module, not in a component, so no route change can
     restart it. The player bar and the intro just call play() / pause().
   - Two <audio> elements ("decks") take turns, so one song can fade out
     while the next fades in; the playlist loops (a single song crossfades
     into itself).
   - Both decks feed one mix, which goes to the music bus.
   - A song that fails to load is skipped; if none load, the site simply
     runs its visuals without music.
   - The current song and position are remembered for the session. */

const SESSION_KEY = 'astnlo:music'
const SONGS = playlist.filter((song) => song?.file)

let graph = null // { ctx, mix }, built on the first play (a gesture)
const decks = []
let active = 0
let outgoing = null // the deck fading out during a crossfade
let index = 0
let resumeAt = 0 // where to start the current song when it first loads
let wanted = false // should music be playing?
let pauseTimer = 0
let lastSaved = 0
const failed = new Set()
const listeners = new Set()
const blockedListeners = new Set()

restore()
let snapshot = build()
if (typeof window !== 'undefined') {
  if (SONGS.length) load(deck(active), index, resumeAt) // metadata only: shows the length
  window.addEventListener('pagehide', () => save(true))
}

/* ─── Public API ───────────────────────────────────────────────── */

/* Start (or keep) playing. Call from a user gesture. `delay` holds the
   fade-in back (the intro waits for the needle to land). */
export function play({ delay = 0, fadeIn = SOUND.music.fadeIn } = {}) {
  wanted = true
  window.clearTimeout(pauseTimer)
  if (!available()) return update()

  connect()
  const d = deck(active)
  wire(d)
  if (d.song !== index) load(d, index, resumeAt)
  fade(d, 1, fadeIn, delay)
  d.el.play().catch((error) => {
    // Autoplay refused (no gesture): stay put, paused, and say so.
    if (error?.name !== 'NotAllowedError' || !wanted) return
    wanted = false
    update()
    blockedListeners.forEach((listener) => listener())
  })
  update()
}

export function pause({ fade: seconds = SOUND.music.pauseFade } = {}) {
  wanted = false
  decks.forEach((d) => fade(d, 0, seconds))
  window.clearTimeout(pauseTimer)
  pauseTimer = window.setTimeout(() => {
    if (wanted) return
    decks.forEach((d) => d.el.pause())
    outgoing = null
  }, seconds * 1000 + 60)
  save(true)
  update()
}

/* The "next song" button. */
export function skip() {
  advance(SOUND.music.skipFade)
}

export function seek(seconds) {
  const d = decks[active]
  if (!d || d.song !== index) {
    resumeAt = Math.max(0, seconds)
    return update()
  }
  if (d.el.readyState < 1) {
    d.seekTo = Math.max(0, seconds) // applied once the song's length is known
    return update()
  }
  d.el.currentTime = Math.min(Math.max(0, seconds), Math.max(0, d.el.duration - 0.25))
  // A seek mid-crossfade settles it: only the current song keeps playing.
  if (outgoing) {
    outgoing.el.pause()
    fade(outgoing, 0, 0)
    outgoing = null
  }
  save(true)
  update()
}

/* Autoplay was refused; the player shows paused. */
export function onBlocked(listener) {
  blockedListeners.add(listener)
  return () => blockedListeners.delete(listener)
}

export function subscribeMusic(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getMusic() {
  return snapshot
}

export function useMusic() {
  return useSyncExternalStore(subscribeMusic, getMusic, getMusic)
}

export function hasMusic() {
  return available()
}

/* ─── Decks ────────────────────────────────────────────────────── */

function deck(i) {
  if (!decks[i]) {
    const el = new Audio()
    el.preload = 'metadata'
    const d = { el, gain: null, song: -1, seekTo: null }
    el.addEventListener('loadedmetadata', () => {
      if (d.seekTo != null) el.currentTime = d.seekTo
      d.seekTo = null
      if (decks[active] === d) update()
    })
    el.addEventListener('timeupdate', () => onTime(d))
    el.addEventListener('playing', update)
    el.addEventListener('pause', update)
    el.addEventListener('waiting', update)
    el.addEventListener('ended', () => {
      if (decks[active] === d && wanted) advance(0.05)
    })
    el.addEventListener('error', () => onError(d))
    decks[i] = d
  }
  return decks[i]
}

function load(d, songIndex, at = 0) {
  d.song = songIndex
  d.el.src = SONGS[songIndex].file
  d.seekTo = at > 0 ? at : null
}

/* Build the mix once, on the first play (a user gesture). */
function connect() {
  if (graph) return
  const out = getMusicOutput()
  if (!out) return
  const { ctx, bus } = out
  const mix = ctx.createGain()
  mix.connect(bus)
  graph = { ctx, mix }
}

function wire(d) {
  if (d.gain || !graph) return
  try {
    const source = graph.ctx.createMediaElementSource(d.el)
    d.gain = graph.ctx.createGain()
    d.gain.gain.value = 0
    source.connect(d.gain).connect(graph.mix)
  } catch {
    // Plays straight out of the element: no fades, no visuals.
  }
}

/* Glide a deck's level to `to` over `seconds`, starting after `delay`. */
function fade(d, to, seconds, delay = 0) {
  if (!d.gain) return
  const param = d.gain.gain
  const now = graph.ctx.currentTime
  param.cancelScheduledValues(now)
  param.setValueAtTime(param.value, now)
  if (delay > 0) param.setValueAtTime(param.value, now + delay)
  param.linearRampToValueAtTime(to, now + delay + Math.max(seconds, 0.01))
}

/* Move to the next playable song, overlapping the two over `seconds`. */
function advance(seconds) {
  const next = nextPlayable(index)
  if (next < 0) return update()
  const from = decks[active]
  const toIndex = decks[active] ? 1 - active : active
  const to = deck(toIndex)
  wire(to)

  index = next
  resumeAt = 0
  load(to, next, 0)
  active = toIndex

  if (wanted && from && from !== to) {
    fade(to, 0, 0)
    fade(to, 1, seconds)
    to.el.play().catch(() => {})
    fade(from, 0, seconds)
    outgoing = from
    window.setTimeout(() => {
      if (decks[active] !== from) from.el.pause()
      if (outgoing === from) outgoing = null
    }, seconds * 1000 + 80)
  } else if (wanted) {
    fade(to, 1, seconds)
    to.el.play().catch(() => {})
  } else if (from && from !== to) {
    from.el.pause()
  }
  save(true)
  update()
}

function onTime(d) {
  if (decks[active] !== d) return
  const { currentTime, duration } = d.el
  const crossfade = SOUND.music.crossfade
  if (wanted && Number.isFinite(duration) && duration > crossfade * 3 && duration - currentTime <= crossfade) {
    advance(crossfade)
    return
  }
  save()
  update()
}

function onError(d) {
  if (d.song < 0 || !d.el.getAttribute('src')) return
  failed.add(d.song)
  if (decks[active] !== d) return
  if (available()) advance(0.05)
  else update()
}

function nextPlayable(from) {
  for (let step = 1; step <= SONGS.length; step += 1) {
    const candidate = (from + step) % SONGS.length
    if (!failed.has(candidate)) return candidate
  }
  return -1
}

function available() {
  return SONGS.length > 0 && failed.size < SONGS.length
}

/* ─── State for the UI ─────────────────────────────────────────── */

function build() {
  const d = decks[active]
  const loaded = d && d.song === index
  const duration = loaded && Number.isFinite(d.el.duration) ? d.el.duration : 0
  const next = available() ? nextPlayable(index) : -1
  return {
    available: available(),
    count: SONGS.length - failed.size,
    song: available() ? SONGS[index] : null,
    next: next >= 0 && next !== index ? SONGS[next] : null,
    playing: wanted,
    time: loaded && d.seekTo == null ? d.el.currentTime : resumeAt,
    duration,
  }
}

function update() {
  snapshot = build()
  listeners.forEach((listener) => listener())
}

/* ─── Session memory ───────────────────────────────────────────── */

function restore() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(SESSION_KEY))
    if (saved && saved.index >= 0 && saved.index < SONGS.length) {
      index = saved.index
      resumeAt = Math.max(0, Number(saved.time) || 0)
    }
  } catch {
    // Start from the top.
  }
}

function save(force = false) {
  const now = performance.now()
  if (!force && now - lastSaved < 1000) return
  lastSaved = now
  const d = decks[active]
  const time = d && d.song === index ? d.el.currentTime : resumeAt
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ index, time }))
  } catch {
    // Not remembered; harmless.
  }
}
