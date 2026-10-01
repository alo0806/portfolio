import { formatTrackTime, readingSeconds } from '../lib/readingTime'
import {
  about,
  linerNotes,
  playground,
  projects,
  tracks as trackList,
  work,
  workSections,
} from './content'

/* Each page's "track length" is its estimated reading time, computed
   from exactly the text that page renders — so editing content.js keeps
   the tracklist honest without touching this file. */

const PAGE_TEXT = {
  // The archive starts collapsed, so its cards don't count.
  '/work': () => {
    const shown = workSections.filter((section) => !section.toggle)
    const visible = projects.filter((p) => shown.some((section) => section.id === p.section))
    return {
      texts: [
        work.title,
        work.linerNotesTitle,
        linerNotes[0]?.text,
        ...shown.flatMap((section) =>
          visible.some((p) => p.section === section.id) ? [section.title, section.subtitle] : [],
        ),
        ...visible.flatMap((p) => [
          p.title,
          p.tag,
          p.role,
          p.oneLiner,
          ...p.metrics.flatMap((m) => [m.label, m.value]),
        ]),
      ],
      visuals: visible.length,
    }
  },
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

/* A page's track: its own path, or the track it lives under — a case
   study at /work/<slug> is part of My Work. */
export function trackIndexFor(pathname) {
  return TRACKS.findIndex((track) => pathname === track.path || pathname.startsWith(`${track.path}/`))
}
