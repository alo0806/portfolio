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
                  ratio?, width?, fullVideo? }
                ratio is width/height ('16/9' by default) so nothing jumps
                while it loads; width (px, optional) keeps a small image
                from being blown up past it; fullVideo is an optional
                link to the whole video. A placeholder (src: null) shows a coloured
                frame in `palette`.
   caseStudy  — Singles only: { context, role, process, outcome,
                outcomeMetrics }. context, role and outcome are a
                paragraph each (or a list of paragraphs); process is a
                list of steps: { title?, text (one paragraph or a list),
                media } */
const placeholderMedia = (palette, count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    type: 'image',
    src: null,
    palette,
    alt: '',
    caption: `Placeholder caption ${i + 1}.`,
    ratio: i === 1 ? '4/5' : '16/10',
  }))

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
    slug: 'gizmo',
    title: 'Gizmo AI: social campaigns',
    section: 'singles',
    tag: 'Marketing',
    role: 'Marketing Associate (remote)',
    year: '2024',
    oneLiner: 'Short-form videos for an AI study app’s TikTok and Instagram, made in a small team for students studying for exams.',
    cover: { image: '/work/gizmo/logo.png', alt: 'The Gizmo logo', palette: 'plum', layout: 'framed' },
    // Every figure comes from src/data/gizmo-stats.json (node
    // scripts/gizmo-stats.js): the Gizmo account during my time on the
    // team, Jan 1 – Oct 31 2024 — not only my own posts.
    metrics: [
      { label: 'Account views', value: '63M' },
      { label: 'Videos posted', value: '602' },
      { label: 'Top video', value: '9.5M' },
    ],
    media: [],
    caseStudy: {
      summary: 'TikTok and Instagram videos for an AI study app, made in a small team to get students to know the app and download it. The numbers are the account’s during my time on the team.',
      context: 'Gizmo is an AI study app that turns your notes into flashcards and quizzes. The team needed a steady stream of short videos on TikTok and Instagram to get students to know the app and download it.',
      role: 'I was a Marketing Associate on a small remote team from January to October 2024. I made short-form videos for Gizmo’s TikTok and Instagram, aimed at students, to build awareness and drive app downloads.',
      process: [
        {
          text: 'Gizmo makes AI flashcards and quizzes, so our audience was students studying for exams. Most videos started with something students already feel: cramming, forgetting everything the night before, wanting to seem effortlessly smart. The app showed up as the fix, not the opening line. We posted almost every day and shared most videos on both platforms.',
          chart: {
            title: 'Videos posted per month, both apps',
            bars: [
              { label: 'Jan', value: 58, display: '58' },
              { label: 'Feb', value: 56, display: '56' },
              { label: 'Mar', value: 59, display: '59' },
              { label: 'Apr', value: 59, display: '59' },
              { label: 'May', value: 20, display: '20' },
              { label: 'Jun', value: 0, display: '0' },
              { label: 'Jul', value: 6, display: '6' },
              { label: 'Aug', value: 115, display: '115' },
              { label: 'Sep', value: 120, display: '120' },
              { label: 'Oct', value: 109, display: '109' },
            ],
            note: 'The account during my time on the team, 2024. Posting stopped in June and was light in May and July. About 9 in 10 videos were under 15 seconds.',
          },
          media: [],
        },
        {
          title: 'Four of the account’s most-viewed videos',
          media: [
            { type: 'image', src: '/work/gizmo/01.webp', alt: 'Video cover: a chemistry textbook and a laptop by lamplight, captioned “how do you remember all this, you’re such a nerd!!”', caption: '4M TikTok · 5.5M Instagram', ratio: '9/16', href: 'https://www.instagram.com/p/DBZM_uxI-W0/', linkLabel: 'Watch on Instagram' },
            { type: 'image', src: '/work/gizmo/02.webp', alt: 'Video cover: colour-coded biology notes on a desk in front of a monitor, captioned “NEVER attend an exam without doing this first”', caption: '3.6M TikTok · 1.7M Instagram', ratio: '9/16', href: 'https://www.tiktok.com/@gizmo.ai/video/7334423620623682848', linkLabel: 'Watch on TikTok' },
            { type: 'image', src: '/work/gizmo/03.webp', alt: 'Video cover: a desk with notes, a highlighter and a monitor, captioned “I would ACE every exam if someone told me this before”', caption: '4.9M Instagram · 1.2M TikTok', ratio: '9/16', href: 'https://www.instagram.com/p/C3-rzOQIBPV/', linkLabel: 'Watch on Instagram' },
            { type: 'image', src: '/work/gizmo/04.webp', alt: 'Video cover: a notebook of chemistry notes in front of a monitor, captioned “I give up, I can’t memorize all of this in one day!”', caption: '3.2M Instagram · 60.5k TikTok', ratio: '9/16', href: 'https://www.instagram.com/p/C4lgQEJoIto/', linkLabel: 'Watch on Instagram' },
          ],
        },
      ],
      findings: [
        {
          title: 'Same video, different app',
          text: 'We usually posted each video to both apps on the same day. Of the 252 I could match, Instagram got more views on 181 (72%), with a median of 1.76× TikTok’s for the same video.',
          chart: {
            title: 'Median views per video posted to both apps',
            bars: [
              { label: 'TikTok', value: 5210, display: '5.2k' },
              { label: 'Instagram', value: 8407, display: '8.4k', highlight: true },
            ],
            note: 'Engagement went the other way (TikTok 4.82%, Instagram 2.26%), but the two apps count it differently, so they can’t be compared directly.',
          },
        },
        {
          title: 'A format worth re-making',
          text: 'In late October, the “don’t worry about how I’m studying” video was re-made 5 times on TikTok. Those versions got a median of 45,600 views, about 8× the account’s usual (5,506), and one of them reached 4M. On Instagram the same versions did about as well as usual, apart from that one. It’s 5 videos, so it’s an observation, not a rule.',
          chart: {
            title: 'TikTok median views',
            bars: [
              { label: 'Account, Jan–Oct', value: 5506, display: '5.5k' },
              { label: 'Account, October', value: 3661, display: '3.7k' },
              { label: 'The re-makes', value: 45600, display: '45.6k', highlight: true },
            ],
            note: 'One version, 4M, is off the chart.',
          },
        },
      ],
      outcome: 'During my time on the team, the account posted 600+ videos across TikTok and Instagram, reaching 63M+ views and about 2M likes. The biggest ones all opened with the viewer, not the product.',
      differently: [
        'I’d track results while we were posting, not after. Looking back at the data showed things I didn’t notice at the time, like Instagram getting more views on the exact same videos, and that would have shaped what we made.',
        'I’d vary the hooks more. Looking back, a lot of our videos started to feel the same, since the whole team leaned on similar openings. I’d also write stronger hooks specifically for Reels instead of reusing the TikTok ones. And since my videos often didn’t show me or even my hands on screen, the visuals had to carry the whole thing. That made aesthetic matter way more than I gave it credit for at the time.',
      ],
      numbers: [
        { value: '5.5k / 8.1k', label: 'Median views per video', context: 'TikTok / Instagram' },
        { value: '1.97M', label: 'Likes', context: 'Both apps' },
        { value: '207k', label: 'Saves', context: 'TikTok' },
        { value: '16.6k', label: 'Shares', context: 'TikTok' },
        { value: '4.2% / 2.8%', label: 'Engagement rate', context: 'TikTok (likes, comments, shares) / Instagram (likes, comments only)' },
        { value: '91%', label: 'Videos under 15 s', context: 'Both apps' },
      ],
      numbersNote: 'The Gizmo account during my time on the team (Jan 1 – Oct 31, 2024), from public post data. TikTok rounds large view counts, so its totals are approximate.',
    },
  },
  {
    slug: 'this-site',
    title: 'This site',
    section: 'singles',
    tag: 'Side project',
    role: 'Design & build',
    year: '2026',
    oneLiner: 'A portfolio that works like a record player: the intro is a turntable, pages are tracks, and the player bar actually plays.',
    cover: { image: '/work/this-site/cover.webp', palette: 'sunset', layout: 'stacked' },
    // Every number here is measured on the production build or taken
    // from the repo's history (see "By the numbers" for how).
    metrics: [
      { label: 'Idle GPU', value: '28% → 0.1%' },
      { label: 'Image weight', value: '−94%' },
      { label: 'Accessibility', value: '100' },
    ],
    media: [],
    caseStudy: {
      summary: 'A portfolio that works like a record player: the intro is a turntable, pages are tracks, and the player bar actually plays.',
      context: 'I’m graduating in 2027 and looking for design engineering and front-end roles. I didn’t want a template with my name on it. I wanted a site that felt like me and showed I can take a design all the way to something you can click.',
      role: 'I came up with the concept and the design direction, and designed a good amount of the UI myself, including the intro screen, the player bar layout, the My Work section structure, and the drawing toy’s card and toolbar. I set up the project, the Git workflow and the deployment: GitHub, Vercel, and the custom domain with DNS. For the rest, Claude Code was my pair programmer: I wrote the briefs for each change, made the design calls (including what to cut), and reviewed and tested everything at desktop and phone size.',
      process: [
        {
          title: 'Finding the concept',
          text: 'I went through four versions in ten days: one long scroll with a blob, a softer take inspired by the game GRIS, a starry intro with real pages, and finally a record player. The first three looked nice, but they said nothing about me and buried the work. Music is a big part of my life, and a record player gave the work an obvious place, so that one stuck.',
          media: [
            { type: 'image', src: '/work/this-site/01.webp', alt: 'Version 1: a large serif headline next to a pink blob with eyes', caption: 'Version 1: one page, one blob', ratio: '16/10' },
            { type: 'image', src: '/work/this-site/03.webp', alt: 'Version 3: "Austin Lo" over a dark, starry sky', caption: 'Version 3: a starry intro', ratio: '16/10' },
            { type: 'image', src: '/work/this-site/05.webp', alt: 'Version 4: an orange-labelled vinyl record and a press play button', caption: 'Version 4: the record', ratio: '16/10' },
          ],
        },
        {
          title: 'Designing the interactions',
          text: [
            'Pages you click between, not one long scroll. People skim, so every page is one click away and the tracklist is always there (a menu on phones).',
            'I designed the player bar so its controls double as navigation: the double arrows move between pages. People already know what those buttons do, so there’s nothing new to learn. Songs got single arrows, so the two never get mixed up.',
            'Each track length is that page’s real reading time. It tells you something useful, and it keeps the record idea honest.',
            'Pressing play drops the needle and spins up the record, then the site opens out of the record’s centre, so it feels like one motion, not a page change. I didn’t want the intro to waste anyone’s time: “skip intro” is always there, it plays once per visit, and a link straight to a page skips it.',
            'Every sound is made in the browser, all in D major pentatonic, so clicking around never sounds off-key. They sit quieter than the music, the music only starts when you press play, and one button mutes everything. My first try at adding music put too much into one change and broke things, so I reverted it and rebuilt it in small steps.',
          ],
          media: [
            { type: 'image', src: '/work/this-site/07.webp', alt: 'The player bar: a tiny vinyl record with the album art as its label, song controls, a seek bar and a volume slider', caption: 'The player bar today.', ratio: '1600/219' },
          ],
        },
        {
          title: 'Making it fast',
          text: 'At full screen on a fast monitor, the site lagged. I measured it in Chrome instead of guessing. Any animation that never stops, even the tiny equalizer, made the browser redraw the whole page 165 times a second. Now every animation runs off one shared loop that stops when nothing is moving, and after 10 seconds without input the always-on loops hold still. Nothing visible changed.',
          chart: {
            title: 'GPU use with My Work left alone',
            unit: '%',
            bars: [
              { label: 'Before', value: 28.2, display: '28%' },
              { label: 'After', value: 0.1, display: '0.1%', highlight: true },
            ],
            note: '1920×1080, median of 3 runs each: the build from just before the fix vs today’s.',
          },
          media: [],
        },
        {
          title: 'The mascot',
          text: 'The cassette was my idea: the blob never fit a record player, so it became a cassette whose reels are its eyes. It follows your cursor and waves with whichever arm is closer. I cut the mouth and the “alo” on its label because they felt off. It used to dance, but the playlist is chill, so now it sits on the player bar, sways to the beat, and gets sleepy when the music stops.',
          media: [
            { type: 'image', src: '/work/this-site/10.webp', alt: 'The old mascot: an orange blob with eyes, in the player bar', caption: 'Before: the blob.', ratio: '840/388' },
            { type: 'image', src: '/work/this-site/11.webp', alt: 'The new mascot: a cassette tape with arms and legs on the edge of the player bar', caption: 'After: the cassette.', ratio: '840/388' },
          ],
        },
      ],
      decisions: [
        { decision: 'Type', why: 'A characterful grotesque for headings, a light sans for reading, and mono only for numbers, because mono digits don’t jitter as times tick.' },
        { decision: 'Color', why: 'Indigo, paper, and one orange. Orange fails contrast as text, so it’s fill-only, with a darker orange for text and focus rings.' },
        { decision: 'The cursor', why: 'Its colour-inverting blend roughly doubled the cost of every frame. I kept it on purpose and saved performance elsewhere.' },
        { decision: 'Work page', why: 'Sections instead of filters, so the whole range shows at a glance, in a few easy chunks.' },
        { decision: 'Accessibility', why: 'Reduced motion is respected, focus is always visible, and everything works with a keyboard except the two toys (drawing and scratching).' },
      ],
      outcome: 'It’s live at this website you’re on right now, built on React and React Router and nothing else. It started as a portfolio and turned into the project I learned the most from.',
      differently: 'Keep every change small from the start, and test at full screen on a fast monitor early, not once it already felt slow.',
      numbers: [
        { value: '99 / 88', label: 'Performance: intro', context: 'Lighthouse, desktop / mobile' },
        { value: '99 / 87', label: 'Performance: My Work', context: 'Lighthouse, desktop / mobile' },
        { value: '3.1 s / 3.2 s', label: 'Mobile LCP', context: 'Intro / My Work, on a simulated slow phone' },
        { value: '160 KB', label: 'JS + CSS', context: 'The whole app, gzipped' },
        { value: '13', label: 'Synthesized sounds', context: 'Zero audio files for effects' },
        { value: '4', label: 'Concepts', context: 'Three explored before the record' },
      ],
      numbersNote: 'Lighthouse: production build, median of 3 runs. GPU: Chrome at 1920×1080. Image weight: 205 MB of originals → 12 MB served.',
    },
  },
  {
    slug: 'lambda-rush',
    title: 'Lambda rush & party campaign',
    section: 'singles',
    tag: 'Campaign',
    role: 'Creative lead',
    year: '—',
    oneLiner: 'Placeholder. Rush videos, posters and socials for a semester of events.',
    cover: { image: '/work/lambda-rush/cover.webp', palette: 'plum', layout: 'initial' },
    metrics: [
      { label: 'Views', value: '—' },
      { label: 'Pieces', value: '—' },
      { label: 'Events', value: '—' },
    ],
    media: [],
    caseStudy: {
      ...placeholderCaseStudy('plum'),
      process: [
        {
          text: 'Placeholder. Fall rush 2026: the identity, the schedule and the rush party.',
          media: [
          { type: 'image', src: '/work/lambda-rush/01.webp', alt: 'Poster: UCLA LFE presents Lambdas, Fall Rush 2026', caption: 'Fall rush 2026', ratio: '4/5' },
          { type: 'image', src: '/work/lambda-rush/02.webp', alt: 'Fall rush 2026 schedule poster: brotherhood BBQ, basketball tourney, rush party', caption: 'Rush schedule', ratio: '4/5' },
          { type: 'image', src: '/work/lambda-rush/03.webp', alt: 'Poster: After Dark rush party, Friday 9/25 at 10pm', caption: 'After Dark (rush party)', ratio: '4/5' },
          ],
        },
        {
          text: 'Placeholder. The parties through the year, each with its own look.',
          media: [
          { type: 'image', src: '/work/lambda-rush/04.webp', alt: 'Poster: After Dark party, Friday 1/9 at 10pm', caption: 'After Dark', ratio: '4/5' },
          { type: 'image', src: '/work/lambda-rush/05.webp', alt: 'Poster: Drift party, with two cars and a halftone texture', caption: 'Drift', ratio: '4/5' },
          { type: 'image', src: '/work/lambda-rush/06.webp', alt: 'Poster: Soundwave, UCLA Lambdas x USC Betas, 4/24 at 10pm', caption: 'Soundwave', ratio: '1279/1600' },
          ],
        },
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
    cover: { image: '/work/spotify-widgets/cover.webp', palette: 'mint', layout: 'framed' },
    metrics: [
      { label: 'Widgets', value: '—' },
      { label: 'Sizes', value: '—' },
      { label: 'Tests', value: '—' },
    ],
    media: [],
    caseStudy: {
      ...placeholderCaseStudy('mint'),
      process: [
        {
          text: 'Placeholder. One player, four sizes: what each size keeps and what it drops.',
          media: [
          { type: 'image', src: '/work/spotify-widgets/01.webp', alt: 'Four Spotify widget designs in different sizes, all playing \'Alone in Space\'', caption: 'The widget sizes', ratio: '1/1' },
          ],
        },
        { text: 'Placeholder. How it was built and shipped.', media: [] },
      ],
    },
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
    cover: { image: '/work/tsa-creative-media/cover.webp', palette: 'citrus', layout: 'stacked' },
    metrics: [{ label: 'Pieces', value: '—' }],
    media: [
      { type: 'image', src: '/work/tsa-creative-media/01.webp', alt: 'Illustrated poster of a girl and a bear eating grass jelly and aiyu desserts in a meadow', caption: 'BYO 仙草 & 愛玉', ratio: '3/4' },
      { type: 'image', src: '/work/tsa-creative-media/02.webp', alt: 'Illustrated poster of a girl and a bear at a New Year’s Eve reunion dinner', caption: 'New Year’s Eve reunion dinner', ratio: '3/4' },
      { type: 'image', src: '/work/tsa-creative-media/03.webp', alt: 'Illustrated poster of a girl and a bear rowing a dragon boat', caption: '端午活動 (Dragon Boat Festival)', ratio: '1147/1427' },
      { type: 'image', src: '/work/tsa-creative-media/board-01.webp', alt: 'Board intro post introducing the Event planning team', caption: 'Board intro: Event planning', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-02.webp', alt: 'Board intro post for a member of Event planning', caption: 'Board intro: Event planning', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-03.webp', alt: 'Board intro post for a member of Event planning', caption: 'Board intro: Event planning', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-04.webp', alt: 'Board intro post for a member of Event planning', caption: 'Board intro: Event planning', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-05.webp', alt: 'Board intro post for a member of Event planning', caption: 'Board intro: Event planning', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-06.webp', alt: 'Board intro post for a member of Event planning', caption: 'Board intro: Event planning', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-07.webp', alt: 'Board intro post for a member of Event planning', caption: 'Board intro: Event planning', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-08.webp', alt: 'Board intro post introducing the Family team', caption: 'Board intro: Family', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-09.webp', alt: 'Board intro post for a member of Family', caption: 'Board intro: Family', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-10.webp', alt: 'Board intro post for a member of Family', caption: 'Board intro: Family', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-11.webp', alt: 'Board intro post for a member of Family', caption: 'Board intro: Family', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-12.webp', alt: 'Board intro post for a member of Family', caption: 'Board intro: Family', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-13.webp', alt: 'Board intro post introducing the Outreach team', caption: 'Board intro: Outreach', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-14.webp', alt: 'Board intro post for a member of Outreach', caption: 'Board intro: Outreach', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-15.webp', alt: 'Board intro post for a member of Outreach', caption: 'Board intro: Outreach', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-16.webp', alt: 'Board intro post for a member of Outreach', caption: 'Board intro: Outreach', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-17.webp', alt: 'Board intro post introducing the Finance team', caption: 'Board intro: Finance', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-18.webp', alt: 'Board intro post for a member of Finance', caption: 'Board intro: Finance', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-19.webp', alt: 'Board intro post for a member of Finance', caption: 'Board intro: Finance', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-20.webp', alt: 'Board intro post for a member of Finance', caption: 'Board intro: Finance', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-21.webp', alt: 'Board intro post for a member of Finance', caption: 'Board intro: Finance', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-22.webp', alt: 'Board intro post introducing the Creative media team', caption: 'Board intro: Creative media', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-23.webp', alt: 'Board intro post for a member of Creative media', caption: 'Board intro: Creative media', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-24.webp', alt: 'Board intro post for a member of Creative media', caption: 'Board intro: Creative media', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-25.webp', alt: 'Board intro post for a member of Creative media', caption: 'Board intro: Creative media', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-26.webp', alt: 'Board intro post for a member of Creative media', caption: 'Board intro: Creative media', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-27.webp', alt: 'Board intro post introducing the Secretary team', caption: 'Board intro: Secretary', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-28.webp', alt: 'Board intro post for a member of Secretary', caption: 'Board intro: Secretary', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-29.webp', alt: 'Board intro post for a member of Secretary', caption: 'Board intro: Secretary', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-30.webp', alt: 'Board intro post introducing the Graduate advisor team', caption: 'Board intro: Graduate advisor', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-31.webp', alt: 'Board intro post for a member of Graduate advisor', caption: 'Board intro: Graduate advisor', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-32.webp', alt: 'Board intro post introducing the President & EVP team', caption: 'Board intro: President & EVP', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-33.webp', alt: 'Board intro post for a member of President & EVP', caption: 'Board intro: President & EVP', ratio: '1/1' },
      { type: 'image', src: '/work/tsa-creative-media/board-34.webp', alt: 'Board intro post for a member of President & EVP', caption: 'Board intro: President & EVP', ratio: '1/1' },
    ],
  },
  {
    slug: 'smc-honor-society',
    title: 'SMC honor society publicity',
    section: 'features',
    tag: 'Team',
    role: 'Publicity',
    year: '—',
    oneLiner: 'Placeholder. Posters and socials for meetings and drives.',
    cover: { image: '/work/smc-honor-society/cover.webp', palette: 'plum', layout: 'framed' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/smc-honor-society/01.webp', alt: 'General meeting announcement in a retro computer-window style, pink with a rainbow', caption: 'General meeting', ratio: '1/1' },
      { type: 'image', src: '/work/smc-honor-society/02.webp', alt: 'General meeting announcement with day and night meeting times', caption: 'General meeting: day & night', ratio: '1/1' },
      { type: 'image', src: '/work/smc-honor-society/03.webp', alt: 'Black-and-white general meeting announcement with stacked window frames and the society crest', caption: 'General meeting', ratio: '1/1' },
      { type: 'image', src: '/work/smc-honor-society/04.webp', alt: 'Coming soon teaser for the AGS Fall 2023 banquet, with cartoon eyes', caption: 'Fall banquet teaser', ratio: '1/1' },
    ],
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
    cover: { image: '/work/yellow-theme-challenge/cover.webp', palette: 'citrus', layout: 'initial' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/yellow-theme-challenge/01.webp', alt: 'Yellow-and-black graphic for practice day 1', caption: 'Day 1', ratio: '1/1' },
      { type: 'image', src: '/work/yellow-theme-challenge/02.webp', alt: 'Yellow-and-black graphic for practice day 2', caption: 'Day 2', ratio: '1/1' },
      { type: 'image', src: '/work/yellow-theme-challenge/03.webp', alt: 'Yellow-and-black graphic for practice day 3', caption: 'Day 3', ratio: '1/1' },
      { type: 'image', src: '/work/yellow-theme-challenge/04.webp', alt: 'Yellow-and-black graphic for practice day 4', caption: 'Day 4', ratio: '1/1' },
      { type: 'image', src: '/work/yellow-theme-challenge/05.webp', alt: 'Yellow-and-black graphic for practice day 6', caption: 'Day 6', ratio: '1/1' },
      { type: 'image', src: '/work/yellow-theme-challenge/06.webp', alt: 'Yellow-and-black graphic for practice day 7', caption: 'Day 7', ratio: '1/1' },
      { type: 'image', src: '/work/yellow-theme-challenge/07.webp', alt: 'Yellow-and-black graphic for practice day 8', caption: 'Day 8', ratio: '1/1' },
      { type: 'image', src: '/work/yellow-theme-challenge/08.webp', alt: 'Yellow-and-black graphic for practice day 9', caption: 'Day 9', ratio: '1/1' },
    ],
  },
  {
    slug: 'switch-menu-remake',
    title: 'Nintendo Switch menu remake',
    section: 'deepcuts',
    tag: 'Remake',
    role: 'UI & motion',
    year: '—',
    oneLiner: 'Placeholder. The home menu, rebuilt.',
    cover: { image: '/work/switch-menu-remake/cover.webp', palette: 'sunset', layout: 'framed' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/switch-menu-remake/01.webp', alt: 'A recreated Nintendo Switch home menu: game tiles over a blurred Mario background', caption: 'The home menu', ratio: '16/9' },
    ],
  },
  {
    slug: 'line-emotes',
    title: 'Line emotes',
    section: 'deepcuts',
    tag: 'Illustration',
    role: 'Illustration',
    year: '—',
    oneLiner: 'Placeholder. A set of sticker emotes.',
    cover: { image: '/work/line-emotes/cover.webp', palette: 'mint', layout: 'stacked' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/line-emotes/01.webp', alt: 'Chibi emote of a girl with a long blue braid: haha', caption: 'Haha', ratio: '346/316', width: 346 },
      { type: 'image', src: '/work/line-emotes/02.webp', alt: 'Chibi emote of a girl with a long blue braid: love', caption: 'Love', ratio: '346/316', width: 346 },
      { type: 'image', src: '/work/line-emotes/03.webp', alt: 'Chibi emote of a girl with a long blue braid: wow', caption: 'Wow', ratio: '346/316', width: 346 },
      { type: 'image', src: '/work/line-emotes/04.webp', alt: 'Chibi emote of a girl with a long blue braid: bashful', caption: 'Bashful', ratio: '346/316', width: 346 },
      { type: 'image', src: '/work/line-emotes/05.webp', alt: 'Chibi emote of a girl with a long blue braid: pat', caption: 'Pat', ratio: '346/316', width: 346 },
      { type: 'image', src: '/work/line-emotes/06.webp', alt: 'Chibi emote of a girl with a long blue braid: shocked', caption: 'Shocked', ratio: '346/316', width: 346 },
      { type: 'image', src: '/work/line-emotes/07.webp', alt: 'Chibi emote of a girl with a long blue braid: cry', caption: 'Cry', ratio: '346/316', width: 346 },
      { type: 'image', src: '/work/line-emotes/08.webp', alt: 'Chibi emote of a girl with a long blue braid: angry', caption: 'Angry', ratio: '346/316', width: 346 },
    ],
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
    cover: { image: '/work/ap-art-3d/cover.webp', palette: 'plum', layout: 'initial' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/ap-art-3d/01.webp', alt: 'Isometric 3D render of a café interior at night, warm lights over wooden tables', caption: 'Café', ratio: '1/1' },
      { type: 'image', src: '/work/ap-art-3d/02.webp', alt: 'Isometric illustration of a cozy bedroom in purple and blue, with plants, fairy lights and a teddy bear', caption: 'Coziness', ratio: '1/1' },
      { type: 'image', src: '/work/ap-art-3d/03.webp', alt: 'Isometric 3D render of a messy bedroom with clothes and papers everywhere', caption: 'Overwhelmed', ratio: '16/9' },
      { type: 'image', src: '/work/ap-art-3d/04.webp', alt: 'Isometric 3D render of a dark, empty room lit by a single small lamp', caption: 'Loneliness', ratio: '16/9' },
      { type: 'image', src: '/work/ap-art-3d/05.webp', alt: 'Isometric 3D render of a tiny island with a house and a dock on clear water', caption: 'Island', ratio: '16/9' },
    ],
  },
  {
    slug: 'house-t-shirts',
    title: 'High school house t-shirts',
    section: 'archive',
    tag: 'School',
    role: 'Apparel design',
    year: '—',
    oneLiner: 'Placeholder. Shirts for the house teams.',
    cover: { image: '/work/house-t-shirts/cover.webp', palette: 'sunset', layout: 'stacked' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/house-t-shirts/01.webp', alt: 'House t-shirt design: Green Dragon house, class of 2023, white line art on green', caption: 'Green Dragon', ratio: '1/1' },
      { type: 'image', src: '/work/house-t-shirts/02.webp', alt: 'House t-shirt design: Red Phoenix house, class of 2023, white line art on red', caption: 'Red Phoenix', ratio: '1/1' },
      { type: 'image', src: '/work/house-t-shirts/03.webp', alt: 'House t-shirt design: White Tiger house, class of 2023, black line art on white', caption: 'White Tiger', ratio: '1/1' },
      { type: 'image', src: '/work/house-t-shirts/04.webp', alt: 'House t-shirt design: Black Turtle house, class of 2023, white line art on black', caption: 'Black Turtle', ratio: '1/1' },
    ],
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
