import { formatTrackTime, readingSeconds } from '../lib/readingTime'
import {
  about,
  linerNotes,
  playground,
  projects,
  tracks as trackList,
  work,
} from './content'

/* Each page's "track length" is its estimated reading time, computed
   from exactly the text that page renders — so editing content.js keeps
   the tracklist honest without touching this file. */

const PAGE_TEXT = {
  '/work': () => ({
    texts: [
      work.title,
      work.linerNotesTitle,
      linerNotes[0]?.text,
      ...projects.flatMap((p) => [
        p.title,
        p.status,
        p.tag,
        p.description,
        ...p.metrics.flatMap((m) => [m.label, m.value]),
      ]),
    ],
    visuals: projects.length,
  }),
  '/about': () => ({
    texts: [
      about.title,
      ...about.paragraphs,
      about.hobbiesTitle,
      ...about.hobbies,
      ...about.photos.map((photo) => photo.caption),
    ],
    visuals: about.photos.length,
  }),
  '/playground': () => ({
    texts: [playground.title, playground.lead, playground.status],
    visuals: 1,
  }),
}

export const TRACKS = trackList.map((track, index) => {
  const { texts, visuals } = PAGE_TEXT[track.path]?.() ?? { texts: [], visuals: 0 }
  const seconds = readingSeconds(texts, visuals)
  return {
    ...track,
    number: index + 1,
    seconds,
    time: formatTrackTime(seconds),
  }
})

export function trackIndexFor(pathname) {
  return TRACKS.findIndex((track) => track.path === pathname)
}
