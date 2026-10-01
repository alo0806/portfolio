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

/* ─── My Work ────────────────────────────────────────────────
   The page's sections, in order. A section with no projects isn't shown.
   `toggle` (archive only): it starts collapsed behind this button. */
export const workSections = [
  { id: 'singles', title: 'Singles', subtitle: 'Featured work' },
  { id: 'features', title: 'Features', subtitle: 'Club and team work' },
  { id: 'deepcuts', title: 'Deep cuts', subtitle: 'Smaller work' },
  { id: 'demos', title: 'Demos', subtitle: 'Works in progress' },
  {
    id: 'archive',
    title: 'Early work',
    subtitle: 'From the archive',
    toggle: { show: 'Show early work', hide: 'Hide early work' },
  },
]

/* Every project. Files go in public/work/<slug>/ — see the README there
   for sizes and formats.

   slug       — its URL: Singles open at /work/<slug>
   section    — 'singles' | 'features' | 'deepcuts' | 'demos' | 'archive'
   tag        — a short label (Side project, Club, Challenge, …)
   role, year — shown on the card / case study
   oneLiner   — one sentence on the card
   cover      — { image?, video?, poster?, alt?, palette, layout }
                With no image or video, a typographic cover is drawn in
                `palette` (any palette name from tokens.css) using
                `layout`: 'stacked' | 'initial' | 'framed'.
   metrics    — [{ label, value }]: Singles show three; Features show the
                first one, if any
   media      — the gallery (everything but Singles), and what case study
                process blocks hold:
                { type: 'image' | 'video', src, poster?, alt, caption?,
                  ratio?, fullVideo? }
                ratio is width/height ('16/9' by default) so nothing jumps
                while it loads; fullVideo is an optional link to the
                whole video. A placeholder (src: null) shows a coloured
                frame in `palette`.
   caseStudy  — Singles only: { context, role, process: [{ text, media }],
                outcome, outcomeMetrics } */
const placeholderMedia = (palette, count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    type: 'image',
    src: null,
    palette,
    alt: '',
    caption: `Placeholder caption ${i + 1}.`,
    ratio: i === 1 ? '4/5' : '16/10',
  }))

// The one placeholder clip (public/work/placeholder/) — safe to delete
// once there's real video; see the README there.
const placeholderClip = {
  type: 'video',
  src: '/work/placeholder/clip.mp4',
  poster: '/work/placeholder/clip-poster.webp',
  alt: 'Placeholder clip: a slowly shifting colour gradient',
  caption: 'Placeholder clip. Short, muted and looping, like a rush video cut-down.',
  ratio: '16/9',
  fullVideo: null,
}

const placeholderCaseStudy = (palette) => ({
  context: 'Placeholder. What this was, who it was for, and the problem it had to solve.',
  role: 'Placeholder. What I owned, who I worked with, and the tools I used.',
  process: [
    {
      text: 'Placeholder. Where it started: research, references, the first rough ideas.',
      media: placeholderMedia(palette, 1),
    },
    {
      text: 'Placeholder. How it changed: the decisions, what got cut, and why.',
      media: placeholderMedia(palette, 2),
    },
    {
      text: 'Placeholder. How it was built and shipped.',
      media: [],
    },
  ],
  outcome: 'Placeholder. What happened once it was out, and what I would do differently.',
  outcomeMetrics: [
    { label: 'Result', value: '—' },
    { label: 'Reach', value: '—' },
    { label: 'Time', value: '—' },
  ],
})

export const projects = [
  /* ─── Singles ─── */
  {
    slug: 'this-site',
    title: 'This site',
    section: 'singles',
    tag: 'Side project',
    role: 'Design & front-end',
    year: '2026',
    oneLiner: 'Placeholder. A portfolio pressed like a record: a tracklist for pages and a player bar that plays.',
    cover: { palette: 'sunset', layout: 'stacked' },
    metrics: [
      { label: 'Built', value: '—' },
      { label: 'Stack', value: '—' },
      { label: 'Time', value: '—' },
    ],
    media: [],
    caseStudy: placeholderCaseStudy('sunset'),
  },
  {
    slug: 'lambda-rush',
    title: 'Lambda rush & party campaign',
    section: 'singles',
    tag: 'Campaign',
    role: 'Creative lead',
    year: '—',
    oneLiner: 'Placeholder. Rush videos, posters and socials for a semester of events.',
    cover: { video: placeholderClip.src, poster: placeholderClip.poster, alt: placeholderClip.alt, palette: 'plum', layout: 'initial' },
    metrics: [
      { label: 'Views', value: '—' },
      { label: 'Pieces', value: '—' },
      { label: 'Events', value: '—' },
    ],
    media: [],
    caseStudy: {
      ...placeholderCaseStudy('plum'),
      process: [
        { text: 'Placeholder. The brief and the first cut.', media: [placeholderClip] },
        { text: 'Placeholder. Posters and socials that matched it.', media: placeholderMedia('plum', 2) },
      ],
    },
  },
  {
    slug: 'spotify-widgets',
    title: 'Spotify widgets',
    section: 'singles',
    tag: 'Concept',
    role: 'UI design',
    year: '—',
    oneLiner: 'Placeholder. Home-screen widgets for what you are listening to.',
    cover: { palette: 'mint', layout: 'framed' },
    metrics: [
      { label: 'Widgets', value: '—' },
      { label: 'Sizes', value: '—' },
      { label: 'Tests', value: '—' },
    ],
    media: [],
    caseStudy: placeholderCaseStudy('mint'),
  },

  /* ─── Features ─── */
  {
    slug: 'tsa-creative-media',
    title: 'TSA creative media',
    section: 'features',
    tag: 'Club',
    role: 'Creative media',
    year: '—',
    oneLiner: 'Placeholder. Graphics and video for the chapter.',
    cover: { palette: 'citrus', layout: 'stacked' },
    metrics: [{ label: 'Pieces', value: '—' }],
    media: [placeholderClip, ...placeholderMedia('citrus', 2)],
  },
  {
    slug: 'smc-honor-society',
    title: 'SMC honor society publicity',
    section: 'features',
    tag: 'Team',
    role: 'Publicity',
    year: '—',
    oneLiner: 'Placeholder. Posters and socials for meetings and drives.',
    cover: { palette: 'plum', layout: 'framed' },
    metrics: [],
    media: placeholderMedia('plum', 3),
  },

  /* ─── Deep cuts ─── */
  {
    slug: 'yellow-theme-challenge',
    title: 'Yellow theme challenge (8 days)',
    section: 'deepcuts',
    tag: 'Challenge',
    role: 'Design',
    year: '—',
    oneLiner: 'Placeholder. One colour, eight days.',
    cover: { palette: 'citrus', layout: 'initial' },
    metrics: [],
    media: placeholderMedia('citrus', 3),
  },
  {
    slug: 'switch-menu-remake',
    title: 'Nintendo Switch menu remake',
    section: 'deepcuts',
    tag: 'Remake',
    role: 'UI & motion',
    year: '—',
    oneLiner: 'Placeholder. The home menu, rebuilt.',
    cover: { palette: 'sunset', layout: 'framed' },
    metrics: [],
    media: placeholderMedia('sunset', 2),
  },
  {
    slug: 'line-emotes',
    title: 'Line emotes',
    section: 'deepcuts',
    tag: 'Illustration',
    role: 'Illustration',
    year: '—',
    oneLiner: 'Placeholder. A set of sticker emotes.',
    cover: { palette: 'mint', layout: 'stacked' },
    metrics: [],
    media: placeholderMedia('mint', 3),
  },

  /* ─── Early work ─── */
  {
    slug: 'ap-art-3d',
    title: 'AP Art 3D',
    section: 'archive',
    tag: 'School',
    role: 'Sculpture',
    year: '2022',
    oneLiner: 'Placeholder. The AP 3D portfolio.',
    cover: { palette: 'plum', layout: 'initial' },
    metrics: [],
    media: placeholderMedia('plum', 3),
  },
  {
    slug: 'house-t-shirts',
    title: 'High school house t-shirts',
    section: 'archive',
    tag: 'School',
    role: 'Apparel design',
    year: '—',
    oneLiner: 'Placeholder. Shirts for the house teams.',
    cover: { palette: 'sunset', layout: 'stacked' },
    metrics: [],
    media: placeholderMedia('sunset', 2),
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
