/* The colored chapters, in page order. Colors are not named here — each
   id maps to its wash and ink in tokens.css. The hero is the gray world
   and is deliberately not a chapter. */

export const CHAPTERS = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'story', label: 'Story' },
  { id: 'contact', label: 'Contact' },
]

export const CHAPTER_IDS = CHAPTERS.map((chapter) => chapter.id)
