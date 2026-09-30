/* Reading time, formatted like a track length. 200 words a minute is a
   common adult silent-reading estimate; each picture-like block (a
   cover, a photo, the waveform) adds a few seconds of looking. */

const WORDS_PER_MINUTE = 200
const SECONDS_PER_VISUAL = 6

export function countWords(texts) {
  return texts
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

export function readingSeconds(texts, visuals = 0) {
  const reading = (countWords(texts) / WORDS_PER_MINUTE) * 60
  return Math.max(1, Math.round(reading + visuals * SECONDS_PER_VISUAL))
}

export function formatTrackTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
