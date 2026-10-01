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
  subline: 'Cognitive Science @ UCLA',
  bio: 'I like designing things in Figma and then actually building them. Still learning, mostly by making stuff like this site.',
}

export const intro = {
  greeting: 'Hi, I’m Austin Lo',
  name: 'Austin Lo', // the part of the greeting whose letters react to the cursor
  aka: '(some people call me alo)',
  recordLabel: 'alo',
  play: 'press play',
  skip: 'skip intro',
  hint: 'give it a spin', // beside the record until it's first scratched
}

/* ─── Background music ─────────────────────────────────────────
   Songs play in this order, then loop. Put the audio files in
   public/audio/ and point `file` at them ('/audio/name.mp3').
   - credit: short text for the license link, e.g. 'CC BY 4.0'.
     Use null if the license doesn't ask for attribution.
   - creditUrl: where that link goes (the song or license page).
   - cover: optional album art ('/covers/songs/name.jpg', in public/),
     shown in the player's cover square. Square images work best.
   With no songs, the player works exactly as before (motion only) and
   shows `nowPlaying`. */
export const playlist = [
  { title: 'Colorful Flowers', artist: 'Tokyo Music Walker', file: '/audio/colorful-flowers.mp3', cover: '/covers/songs/colorful-flowers.jpg', credit: null, creditUrl: null },
  { title: 'Greetings', artist: 'Low.F.M', file: '/audio/greetings.mp3', cover: '/covers/songs/greetings.jpg', credit: null, creditUrl: null },
  { title: 'Radio', artist: 'Riddiman & Joe Leytrick', file: '/audio/radio.mp3', cover: '/covers/songs/radio.jpg', credit: null, creditUrl: null },
  { title: 'After the Rain', artist: 'Frad x Jordy Chandra', file: '/audio/after-the-rain.mp3', cover: '/covers/songs/after-the-rain.jpg', credit: null, creditUrl: null },
  { title: 'Butterfly', artist: 'Sleepy Fish', file: '/audio/butterfly.mp3', cover: '/covers/songs/butterfly.jpg', credit: null, creditUrl: null },
  { title: 'East Side Manhattan', artist: 'Popoi', file: '/audio/east-side-manhattan.mp3', cover: '/covers/songs/east-side-manhattan.jpg', credit: null, creditUrl: null },
]

/* Shown in the player bar while the playlist is empty. */
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

/* icon: 'email' | 'linkedin' | 'github' | 'resume' */
export const links = [
  { label: 'Email', href: 'mailto:austnlo@ucla.edu', icon: 'email' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/austin-l-7a7862302', icon: 'linkedin' },
  { label: 'GitHub', href: '#', icon: 'github' }, // '#' = not set yet
  { label: 'Resume', href: '#', icon: 'resume' },
]

/* `{song}` and `{artist}` are filled in from the song playing now
   (or nowPlaying, while the playlist is empty). */
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
    'In high school I knew I wanted to do something with design, but I didn’t really know what that looked like. A friend told me to try UI/UX, so I did, and somewhere along the way I got hooked on front-end: the part where something in your head turns into something you can actually click.',
    'Now I study cognitive science at UCLA, which ended up being a good fit, since a lot of it is about how people think, and that’s most of design anyway. This site is the biggest thing I’ve built so far. I’m graduating in spring 2027 and looking for design engineering or front-end roles, so if you’re working on something fun, I’d love to hear about it.',
  ],
  hobbiesTitle: 'Off the record',
  hobbies: [
    'Watching the Warriors and letting the result decide my mood for the day (FRONT OFFICE DO SOMETHINGGG)',
    'Gaming with friends, usually something chaotic',
    'Music, all of it. Also a big raver',
  ],
  /* Photos live in public/photos/ as 800×1000 WebP (the frames are 4:5).
     `alt` describes the picture for screen readers; the caption is what
     everyone sees. `palette` is the colour shown while it loads. */
  photos: [
    {
      image: '/photos/burger.webp',
      alt: 'Austin mid-bite into a burger in a kitchen, looking at the camera',
      caption: 'my fatass caught in 4k',
      palette: 'sunset',
      tilt: '-3deg',
    },
    {
      image: '/photos/taipei.webp',
      alt: 'Taipei 101 lit up white and green at night',
      caption: 'Taipei, Taiwan',
      palette: 'mint',
      tilt: '2deg',
    },
    {
      image: '/photos/niteharts.webp',
      alt: 'A festival stage at night: a giant heart sculpture hanging from a crane, light beams and a crowd with hands up',
      caption: 'Niteharts',
      palette: 'plum',
      tilt: '-1.5deg',
    },
  ],
}

export const playground = {
  title: 'B-sides',
  lead: 'Placeholder. Small experiments, toys, and things that didn’t make the album.',
  status: 'Coming soon',
}
