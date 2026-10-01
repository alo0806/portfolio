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
   - Only what's needed is downloaded: the current song (its length first,
     then as it plays), and the next one only shortly before its crossfade
     (config: music.preloadLead). Nobody downloads the whole playlist.
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
let delayTimer = 0
let holdAt = null // during a delayed start: where the song will (re)start from
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
   music back (the intro lets its needle-drop and crackle play first).
   Browsers only allow audio to start inside the click, so with a delay
   the song starts now but silently; when the delay is up it goes back to
   where it started and fades in, so none of it is missed. */
export function play({ delay = 0, fadeIn = SOUND.music.fadeIn } = {}) {
  const alreadyPlaying = wanted && Boolean(decks[active]) && !decks[active].el.paused && holdAt == null
  wanted = true
  window.clearTimeout(pauseTimer)
  window.clearTimeout(delayTimer)
  const waitingFrom = holdAt // already holding? keep its start point
  holdAt = null
  if (!available()) return update()

  connect()
  const d = deck(active)
  wire(d)
  if (d.song !== index) load(d, index, resumeAt)
  // A song already playing (e.g. "press play" again after going back to
  // the record) just keeps going: no silence, no rewind.
  if (delay > 0 && d.gain && !alreadyPlaying) {
    holdAt = waitingFrom ?? d.seekTo ?? d.el.currentTime
    fade(d, 0, 0)
    delayTimer = window.setTimeout(() => {
      const from = holdAt
      holdAt = null
      if (!wanted || decks[active] !== d) return update()
      if (d.el.readyState >= 1) d.el.currentTime = from
      else d.seekTo = from
      fade(d, 1, fadeIn)
      update()
    }, delay * 1000)
  } else {
    fade(d, 1, fadeIn)
  }
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
  window.clearTimeout(delayTimer)
  if (holdAt != null) {
    seek(holdAt) // paused before it came in: keep the start of the song
    holdAt = null
  }
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

/* The next / previous song buttons. While paused they just move to the
   song (it starts when play is pressed). */
export function skip() {
  advance(SOUND.music.skipFade)
}

export function previous() {
  advance(SOUND.music.skipFade, prevPlayable(index))
}

/* Picking a song from the queue: crossfade to it and play. Call from a
   user gesture. Picking the current song just makes sure it's playing. */
export function playSong(songIndex) {
  if (!available() || songIndex < 0 || songIndex >= SONGS.length) return
  if (songIndex === index) {
    play()
    return
  }
  wanted = true
  window.clearTimeout(pauseTimer)
  connect()
  advance(SOUND.music.skipFade, songIndex)
}

export function seek(seconds) {
  if (holdAt != null) holdAt = Math.max(0, seconds) // still waiting to come in: start from here
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

/* Point a deck at a song. 'metadata' fetches just enough to know its
   length (playing fetches the rest as needed); 'auto' downloads it ahead. */
function load(d, songIndex, at = 0, preload = 'metadata') {
  d.song = songIndex
  d.el.preload = preload
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

/* Move to another song (the next playable one by default), overlapping
   the two over `seconds`. If the next song was already preloaded on the
   other deck, that copy is used rather than fetching it again. */
function advance(seconds, target = nextPlayable(index)) {
  const next = target
  if (next < 0 || failed.has(next)) return update()
  // Moving on during a delayed start: the new song comes in normally.
  window.clearTimeout(delayTimer)
  holdAt = null
  const from = decks[active]
  const toIndex = decks[active] ? 1 - active : active
  const to = deck(toIndex)
  wire(to)

  index = next
  resumeAt = 0
  if (to.song === next && to.el.getAttribute('src') === SONGS[next].file) {
    to.el.currentTime = 0 // preloaded: start from the top
    to.seekTo = null
  } else {
    load(to, next, 0)
  }
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
  const { crossfade, preloadLead } = SOUND.music
  if (wanted && Number.isFinite(duration) && duration > crossfade * 3) {
    const left = duration - currentTime
    if (left <= crossfade) {
      advance(crossfade)
      return
    }
    if (left <= crossfade + preloadLead) preloadNext()
  }
  save()
  update()
}

/* Shortly before a crossfade, start downloading the next song on the
   other deck, so it's ready to play the moment it's needed. */
function preloadNext() {
  const next = nextPlayable(index)
  if (next < 0 || next === index) return
  const other = deck(1 - active)
  if (other === outgoing) return
  if (other.song === next && other.el.getAttribute('src') === SONGS[next].file) return
  load(other, next, 0, 'auto')
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

function prevPlayable(from) {
  for (let step = 1; step <= SONGS.length; step += 1) {
    const candidate = (from - step + SONGS.length) % SONGS.length
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
  const prev = available() ? prevPlayable(index) : -1
  return {
    available: available(),
    songs: SONGS,
    index,
    count: SONGS.length - failed.size,
    song: available() ? SONGS[index] : null,
    next: next >= 0 && next !== index ? SONGS[next] : null,
    prev: prev >= 0 && prev !== index ? SONGS[prev] : null,
    playing: wanted,
    // During a delayed start the song is running silently; show where it
    // will actually begin instead.
    time: holdAt ?? (loaded && d.seekTo == null ? d.el.currentTime : resumeAt),
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
