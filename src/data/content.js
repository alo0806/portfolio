/* ─────────────────────────────────────────────────────────────
   ALL EDITABLE CONTENT LIVES HERE.
   Change text freely; components only render what's in this file.

   Colors are referenced by palette name ('sunset', 'plum', …) and
   defined in src/styles/tokens.css, so this file never holds a color.
   Track times are NOT written here — they're computed from each page's
   reading time (see src/data/tracks.js).
   ───────────────────────────────────────────────────────────── */

export const artist = {
  name: 'Austin Lo',
  subline: 'design engineer · cog sci @ UCLA',
  bio: 'Placeholder. I design in Figma and build in React — interfaces that feel considered from the first frame to the last line of CSS.',
}

export const intro = {
  greeting: 'Hi, I’m Austin Lo',
  aka: '(some people call me alo)',
  recordLabel: 'alo',
  play: 'press play',
  skip: 'skip intro',
}

/* ─── Background music ─────────────────────────────────────────
   Songs play in this order, then loop. Put the audio files in
   public/audio/ and point `file` at them ('/audio/name.mp3').
   - credit: short text for the license link, e.g. 'CC BY 4.0'.
     Use null if the license doesn't ask for attribution.
   - creditUrl: where that link goes (the song or license page).
   With no songs, the player runs visuals only and shows `nowPlaying`. */
export const playlist = [
  // { title: 'Song Title', artist: 'Artist', file: '/audio/song.mp3', credit: 'CC BY 4.0', creditUrl: 'https://…' },
]

/* Shown in the player bar when the playlist is empty. */
export const nowPlaying = {
  song: 'Placeholder Song Title',
  artist: 'Placeholder Artist',
}

/* The tracklist, in order. `path` is the page's URL; `cover` picks the
   player bar's cover-square palette while that page is playing. */
export const tracks = [
  { path: '/work', title: 'My Work', cover: 'sunset' },
  { path: '/about', title: 'About Me', cover: 'plum' },
  { path: '/playground', title: 'Playground', cover: 'mint' },
]

/* icon: 'email' | 'linkedin' | 'github' | 'resume'
   The resume has no href: it opens the locked-track box (see `resume`). */
export const links = [
  { label: 'Email', href: 'mailto:hello@astnlo.com', icon: 'email' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' }, // '#' = not set yet
  { label: 'GitHub', href: '#', icon: 'github' },
  { label: 'Resume', icon: 'resume', locked: true },
]

/* The resume is a "locked track": a code unlocks it. The code and the
   file live on the server (Vercel environment variables — see
   .env.example), never in this file. The email fallback uses the Email
   link above. */
export const resume = {
  label: 'Locked track',
  title: 'Resume',
  prompt: 'Enter the code to play it.',
  field: 'Code',
  unlock: 'Unlock',
  unlocking: 'Unlocking…',
  wrong: 'Not quite — try again.',
  tooMany: 'Too many tries. Take a short break and try again in a few minutes.',
  unavailable: 'The resume can’t be loaded right now — email me and I’ll send it.',
  blocked: 'Unlocked! Your browser held back the new tab — open it here:',
  open: 'Open resume',
  fallback: 'Don’t have the code?',
  fallbackLink: 'Email me',
}

/* `{song}` and `{artist}` are filled in from the song playing now. */
export const mascotLines = [
  'hi there!',
  'now spinning: {song}',
  'this one’s by {artist}. good taste, right?',
  'oh — you found me.',
  'press pause if the wiggling is too much.',
  'skip to the next track, i dare you.',
]

/* ─── Pages ─────────────────────────────────────────────────── */

export const work = {
  title: 'My Work',
  linerNotesTitle: 'Liner notes',
  allNotesLabel: 'All notes',
}

/* Newest first; the Work page shows the first entry. */
export const linerNotes = [
  {
    date: '2026-09-30',
    text: 'Placeholder. Re-pressed the whole site as a record — a tracklist for pages and a player bar that actually does things.',
  },
]

/* cover.layout: 'stacked' | 'initial' | 'framed'
   cover.palette: any palette name from tokens.css
   image: optional — { src: '/covers/name.jpg', alt: 'what it shows' }.
   Put images in /public/covers/. Without one, the typographic cover
   is drawn instead. */
export const projects = [
  {
    title: 'Project One',
    tag: 'Side project',
    description: 'Placeholder. One line about what it does and who it is for.',
    metrics: [
      { label: 'Users', value: '—' },
      { label: 'Shipped', value: '—' },
      { label: 'Role', value: '—' },
    ],
    cover: { palette: 'sunset', layout: 'stacked' },
    image: null,
  },
  {
    title: 'Project Two',
    tag: 'Internship',
    description: 'Placeholder. One line about the problem and what changed.',
    metrics: [
      { label: 'Impact', value: '—' },
      { label: 'Team', value: '—' },
      { label: 'Length', value: '—' },
    ],
    cover: { palette: 'plum', layout: 'initial' },
    image: null,
  },
  {
    title: 'InnoDesign redesign',
    status: 'In progress',
    tag: 'Club',
    description: 'Placeholder. A self-directed rework, audited before redrawn.',
    metrics: [
      { label: 'Pages', value: '—' },
      { label: 'Tests', value: '—' },
      { label: 'Stage', value: '—' },
    ],
    cover: { palette: 'citrus', layout: 'framed' },
    image: null,
  },
]

export const about = {
  title: 'About the artist',
  paragraphs: [
    'Placeholder. I study cognitive science at UCLA, which mostly means I spend a lot of time thinking about why people do the thing they do instead of the thing the interface expected.',
    'Placeholder. I like the part of the work where a design stops being a picture and starts being something you can click — moving between Figma and the editor until the two agree.',
  ],
  hobbiesTitle: 'Off the record',
  hobbies: [
    'Placeholder — long walks with a podcast',
    'Placeholder — making playlists nobody asked for',
    'Placeholder — mechanical keyboards I do not need',
    'Placeholder — sketching interfaces on the bus',
  ],
  photos: [
    { caption: 'Placeholder one', palette: 'sunset', tilt: '-3deg' },
    { caption: 'Placeholder two', palette: 'mint', tilt: '2deg' },
    { caption: 'Placeholder three', palette: 'plum', tilt: '-1.5deg' },
  ],
}

export const playground = {
  title: 'B-sides',
  lead: 'Placeholder. Small experiments, toys, and things that didn’t make the album.',
  status: 'Coming soon',
}
