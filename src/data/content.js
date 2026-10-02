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

/* icon: 'email' | 'linkedin' | 'github' | 'resume'
   soon: true shows the link greyed out with a "soon" tag and no href,
   in the same spot. To turn one on, give it its href and drop `soon`. */
export const links = [
  { label: 'Email', href: 'mailto:austnlo@ucla.edu', icon: 'email' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/austin-l-7a7862302', icon: 'linkedin' },
  { label: 'GitHub', href: null, icon: 'github', soon: true },
  { label: 'Resume', href: null, icon: 'resume', soon: true },
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
    date: '2026-10',
    text: 'Rebuilt this site as a record player and finally put my work in it. Next up: a Spotify-style widget for the B-sides page and a redesign of my fraternity’s ticket flow. Graduating spring 2027 and looking for design engineering and front-end roles.',
  },
]

/* ─── My Work ────────────────────────────────────────────────
   The page's sections, in order. A section with no projects isn't shown.
   `toggle` (archive only): it starts collapsed behind this button. */
export const workSections = [
  { id: 'singles', title: 'Singles', subtitle: 'Featured work' },
  { id: 'features', title: 'Features', subtitle: 'Club and team work' },
  { id: 'deepcuts', title: 'Deep Cuts', subtitle: 'Smaller work' },
  { id: 'demos', title: 'Demos', subtitle: 'Works in progress' },
  {
    id: 'archive',
    title: 'Early Work',
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

/* The nine events in the pricing case study, from my analysis dashboard
   (the raw exports stay in the gitignored data/ folder). `price` is the
   average paid per ticket, `sold` the presales, and `cum` the share of
   presales sold by 10, 9 … 1 days out and on the day, from a 10pm
   start. `est`: the price is an estimate. No money totals here. */
const pricingEvents = [
  { name: 'Halloween', date: '10/25', venue: 'frat', pricing: 'flat', price: 10, sold: 43, place: 'right-down', cum: [0, 0, 0, 0, 0, 11.6, 20.9, 30.2, 62.8, 81.4, 100] },
  { name: 'Lost in Lambda', date: '11/22', venue: 'roof', pricing: 'ladder', price: 13.73, sold: 78, place: 'above', cum: [3.8, 5.8, 5.8, 5.8, 5.8, 5.8, 9.6, 23.1, 50, 86.5, 100] },
  { name: 'After Dark', date: '1/9', venue: 'roof', pricing: 'ladder', price: 14, sold: 57, place: 'right-down', dash: [6, 4], cum: [0, 0, 0, 0, 0, 0, 0, 7.5, 26.4, 79.2, 100] },
  { name: 'Inferno', date: '2/7', venue: 'frat', pricing: 'ladder', price: 18, sold: 157, est: true, place: 'below', cum: [2.5, 3.8, 5.1, 10.8, 14.6, 33.1, 38.9, 54.1, 71.3, 81.5, 100] },
  { name: 'W9 Rager', date: '3/7', venue: 'frat', pricing: 'member / general', price: 12.5, sold: 173, place: 'left', dash: [6, 4], cum: [0, 0, 0, 0, 1.2, 2.9, 9.8, 16.2, 29.5, 56.1, 100] },
  { name: 'Drift', date: '4/3', venue: 'yard', pricing: 'flat', price: 10, sold: 55, place: 'right-up', cum: [0, 0, 0, 0, 0, 0, 0, 1.9, 3.7, 14.8, 100] },
  { name: 'Soundwave', date: '4/24', venue: 'yard', pricing: 'flat', price: 14, sold: 61, place: 'right-up', dash: [6, 4], cum: [0, 0, 0, 0, 0, 0, 0, 13.1, 21.3, 27.9, 100] },
  { name: 'Lucid Dream', date: '4/30', venue: 'frat', pricing: 'member / general', price: 12.7, sold: 160, place: 'left', dash: [2, 3], cum: [0, 0, 0, 0, 0, 0, 0, 6.2, 23.8, 48.8, 100] },
  { name: 'After Dark', date: '9/25', venue: 'yard', pricing: 'ladder', price: 12.93, sold: 157, est: true, place: 'below', dash: [2, 3], cum: [0, 0, 0, 0, 0, 0, 0, 6.4, 13.4, 24.2, 100] },
]


export const projects = [
  /* ─── Singles ─── */
  {
    slug: 'this-site',
    title: 'This Site',
    section: 'singles',
    tag: 'Side project',
    role: 'Design & build',
    year: '2026',
    oneLiner: 'A portfolio that works like a record player.',
    cover: { art: 'record', palette: 'sunset' },
    // Every number here is measured on the production build or taken
    // from the repo's history (see "By the numbers" for how).
    // The one stat on its card; the full set is on the case study.
    headline: { value: '28% → 0.1%', label: 'idle GPU' },
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
    slug: 'gizmo',
    title: 'Gizmo AI: Social Campaigns',
    section: 'singles',
    tag: 'Marketing',
    role: 'Marketing Associate',
    year: '2024',
    oneLiner: 'Short-form videos for an AI study app.',
    cover: { art: 'gizmo', palette: 'plum' },
    // Every figure comes from src/data/gizmo-stats.json (node
    // scripts/gizmo-stats.js): the Gizmo account during my time on the
    // team, Jan 1 – Oct 31 2024 — not only my own posts.
    // The one stat on its card; the full set is on the case study.
    headline: { value: '63M+', label: 'views' },
    metrics: [
      { label: 'Views during my time', value: '63M+' },
      { label: 'Posts', value: '602' },
      { label: 'Top video, both platforms', value: '9.5M' },
    ],
    media: [],
    caseStudy: {
      summary: 'TikTok and Instagram videos for an AI study app, made in a small team to get students to know the app and download it. The numbers are the account’s during my time on the team.',
      context: 'Gizmo is an AI study app that turns notes into flashcards and quizzes. Its audience is students, so most of its marketing lived on TikTok and Instagram.',
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
    slug: 'aspiration',
    title: 'Aspiration: Making Donating Effortless',
    section: 'singles',
    tag: 'HCI',
    role: 'Team project',
    year: '2025',
    oneLiner: 'Round-up donations at checkout, so giving becomes a habit.',
    cover: { art: 'aspiration', palette: 'mint' },
    // From our CS 188 blog post, user research write-ups and poster (Fall
    // 2025), kept out of the repo in data/. Interview counts are the blog's
    // (18 + 13); the 80% / 27% / 63% are the poster's summary of 30 of them.
    // The one stat on its card; the full set is on the case study.
    headline: { value: '80% → 27%', label: 'donated → donate regularly' },
    metrics: [
      { label: 'Interviews', value: '31' },
      { label: 'Donated → donate regularly', value: '80% → 27%' },
      { label: 'Cite money', value: '63%' },
    ],
    media: [],
    caseStudy: {
      summary: 'A Chrome extension and web app that rounds up online purchases and donates the change, so giving becomes a habit instead of a decision.',
      context: [
        'Aspiration was our team project for CS 188, Human-Computer Interaction, at UCLA in Fall 2025, with Matthew Day, Rakil Kim and Alan Lin. The quarter’s theme was sustainable environments, and we read it as social sustainability: how do you get people to keep doing something they already think they should?',
        'We landed on giving. Matthew, who’s involved in UCLA’s Effective Altruism club, pointed out the gap: most people think they should donate, but almost no one does it consistently. And most platforms make you choose between a big one-time gift and a monthly subscription, which doesn’t work for students and young people on tight budgets.',
        'Aspiration has two parts: a web app, prototyped with Lovable (React, TypeScript, Tailwind and Supabase), and a Chrome extension, built separately. Purchases were simulated, since we didn’t want to collect anyone’s real bank details.',
      ],
      role: 'It was a team of four, and we all did a bit of everything: interviews, synthesis, design, and testing. I also made the paper storyboards that turned our research into the first flows.',
      process: [
        {
          title: 'Research, round 1',
          text: [
            'We started with 18 semi-structured interviews, two of us at each one: one talking, one taking notes. Money is a sensitive thing to bring up with strangers, so we reached out to people we knew first, mostly students.',
            'Nearly everyone had donated at least once, mostly to charities, and some to churches or other nonprofits. But they gave inconsistently. The open format gave us a broad picture, but it wasn’t deep enough to build a strong problem statement on.',
          ],
          media: [
            { type: 'image', src: '/work/aspiration/research-pie-sketch.webp', alt: 'Hand-drawn pie chart of where people had given: charity, church, nonprofit, other, and nonmonetary', caption: 'Where people had given', ratio: '800/822', width: 400 },
          ],
        },
        {
          title: 'Changing the method',
          text: [
            'In a Design Studio session, the course staff helped us narrow down what we actually needed to learn. So for round 2 we switched to structured interviews: the same questions for everyone, focused on why people do or don’t donate, and how they do it. Asking everyone the same questions also meant we could compare notes across interviewers.',
            'Looking back, we wished we’d started there: from what people actually experience, instead of starting with an idea and fitting the research around it.',
          ],
        },
        {
          title: 'Research, round 2',
          text: [
            'We ran 13 structured interviews with new people. Three things kept coming up. Trust: people weren’t sure their money would go where it was supposed to, and some brought up recent scams and misused funds. Money: most were students already paying for food, rent and tuition, so giving felt like a luxury they couldn’t justify yet. And inconvenience: donating was its own task and its own decision.',
          ],
          chart: {
            title: 'Most people have given. Few give consistently.',
            bars: [
              { label: 'Have donated at least once', value: 80, display: '80%', tone: 'teal' },
              { label: 'Donate frequently or consistently', value: 27, display: '27%', tone: 'hi' },
              { label: 'Cite money as a barrier to giving more', value: 63, display: '63%' },
            ],
            note: 'From our poster’s summary of 30 of the interviews.',
          },
        },
        {
          title: 'The reframe',
          text: [
            'Our first scope was too broad: we wanted to tackle people’s trust in charities in general. The course staff pushed us to stop trying to fix charities’ reputations and fix the act of donating instead. Pushing people to trust a charity could feel manipulative, but a donating experience that’s clear and easy could earn some trust on its own. That left three goals:',
            'Convenience. Round purchases up and donate the difference, so giving rides along with shopping instead of being a separate task or a big decision.',
            'Trust through transparency. Show clearly where the money goes, with third-party charity verification and impact reports from GiveWell.',
            'Financial control. Users choose their charity when they set up, and can change it at any time.',
          ],
        },
        {
          title: 'From storyboards…',
          text: 'We storyboarded the problem and the idea on paper, with personas and a scenario: a student asked to donate at a booth on campus, unsure where the money would even go.',
          media: [
            { type: 'image', src: '/work/aspiration/storyboard-comic.webp', alt: 'Storyboard comic: a student passes an animal welfare booth, wonders where the money would even go, gives reluctantly, then finds Aspiration on their phone', caption: 'Storyboard, by me', ratio: '1000/1333' },
            { type: 'image', src: '/work/aspiration/storyboard-paper.webp', alt: 'Paper storyboard panels drawn in pen, taped to green paper', caption: 'Paper storyboard, by me', ratio: '1400/1115' },
            { type: 'image', src: '/work/aspiration/storyboard-board.webp', alt: 'Storyboards, two persona cards and a scenario laid out on a wooden floor', caption: 'Personas and scenario storyboard, by Matthew Day', ratio: '1400/1230' },
          ],
        },
        {
          title: '…to a prototype',
          text: 'The final flow: pick a charity when you set up, get a popup at checkout offering to round up, then check the dashboard to see where it all went.',
          media: [
            { type: 'image', src: '/work/aspiration/screen-select-charity.webp', alt: 'Aspiration web app: Select your charity, with four charity cards over a forest background', caption: '1. Pick a charity', ratio: '1600/817' },
            { type: 'image', src: '/work/aspiration/screen-checkout-popup.webp', alt: 'Extension popup over an Amazon checkout: Make an impact?, with the purchase price, rounded total and donation', caption: '2. Round up at checkout', ratio: '1200/1135' },
            { type: 'image', src: '/work/aspiration/screen-dashboard.webp', alt: 'Dashboard: this month and all-time totals, lives impacted, round-ups, and a donation history', caption: '3. See where it went', ratio: '1200/1098' },
            { type: 'image', src: '/work/aspiration/screen-impact-tree.webp', alt: 'Your Impact Tree: a small sprout, with a progress bar to the next stage', caption: 'The impact tree', ratio: '1000/1051' },
          ],
        },
        {
          title: 'The impact tree',
          text: 'The web app also shows a tree that grows with your total donations, from a seed to a forest in 10 stages. We added it to make giving a bit more fun, and it plays into what testers liked most: watching small round-ups add up.',
          mediaLayout: 'scroll',
          mediaLabel: 'The impact tree’s 10 growth stages',
          media: [
            { type: 'image', src: '/work/aspiration/tree/stage-01.webp', alt: 'Impact tree, stage 1 of 10: a seed', caption: 'Stage 1', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-02.webp', alt: 'Impact tree, stage 2 of 10: a seed starting to sprout', caption: 'Stage 2', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-03.webp', alt: 'Impact tree, stage 3 of 10: a small sprout', caption: 'Stage 3', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-04.webp', alt: 'Impact tree, stage 4 of 10: a sapling', caption: 'Stage 4', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-05.webp', alt: 'Impact tree, stage 5 of 10: a young tree', caption: 'Stage 5', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-06.webp', alt: 'Impact tree, stage 6 of 10: a full tree', caption: 'Stage 6', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-07.webp', alt: 'Impact tree, stage 7 of 10: a small grove', caption: 'Stage 7', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-08.webp', alt: 'Impact tree, stage 8 of 10: a bigger grove', caption: 'Stage 8', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-09.webp', alt: 'Impact tree, stage 9 of 10: a forest', caption: 'Stage 9', ratio: '1/1' },
            { type: 'image', src: '/work/aspiration/tree/stage-10.webp', alt: 'Impact tree, stage 10 of 10: a wide forest', caption: 'Stage 10', ratio: '1/1' },
          ],
        },
        {
          title: 'Usability testing',
          text: [
            'We tested with 4 UCLA students who matched our audience: 1 pilot session to fix our script, then 3 full sessions of 20–30 minutes, in person on a laptop. Each person did two scenarios: set up Aspiration and pick a charity, then simulate an online purchase, round up at checkout, and check the dashboard. They thought aloud the whole time.',
            'Afterwards they rated, on a 7-point scale, how easy the round-up was to understand, how comfortable they’d be using it with their own money, and how well they understood where their donations went, followed by a short interview.',
            'With so few people, we treated the ratings as descriptive, not as statistics. We noted where people got stuck, paused or backtracked, grouped their comments into convenience, transparency and control, and mapped them back to our design goals.',
          ],
        },
      ],
      findingsTitle: 'What worked, and what didn’t',
      findings: [
        {
          title: 'Worked: the popup felt like checkout',
          text: 'Testers consistently completed a round-up through the extension without major help, and several called it intuitive, like other browser add-ons. A popup at checkout asking you to confirm a small extra charge fit how people already pay online.',
        },
        {
          title: 'Worked: watching it add up',
          text: 'On the dashboard, people liked seeing their donation history and total, and several said watching small round-ups add up made the idea feel more concrete and meaningful.',
        },
        {
          title: 'Didn’t: picking a charity',
          text: 'Most of the friction came at setup. People hesitated at choosing a charity, unsure if it was a permanent commitment, and wanted more context first. One tried to skip it, expecting to choose for each purchase. You could change it later, but nothing said so.',
        },
        {
          title: 'Didn’t: the breakdown got missed',
          text: 'In the popup, people went straight for the button and often missed the breakdown of purchase price, round-up and total.',
        },
        {
          title: 'Didn’t: no way to set limits',
          text: 'Almost every tester asked for more control: a monthly cap, a pause for tight months, or a way to leave out certain stores. And that was with simulated money.',
        },
      ],
      next: {
        text: 'Testing pointed at two fixes. Charity selection needs to feel low-stakes: a short description and impact for each charity, and a clear note that you can change it anytime. And people want a way to limit their giving, so I’d add a monthly cap and a pause button right on the dashboard.',
        showImages: false, // turn on once the images below are real
        media: [
          { type: 'image', src: null, palette: 'mint', alt: '', caption: 'Placeholder', ratio: '4/3' },
          { type: 'image', src: null, palette: 'mint', alt: '', caption: 'Placeholder', ratio: '4/3' },
          { type: 'image', src: null, palette: 'mint', alt: '', caption: 'Placeholder', ratio: '4/3' },
        ],
      },
      decisions: [
        {
          decision: 'Round-ups instead of one-off gifts or subscriptions',
          why: 'Most platforms make you choose between giving a lot at once or signing up monthly. Small round-ups fit a student budget.',
        },
        {
          decision: 'Fix the interaction, not the reputation',
          why: 'We can’t control what people think of a charity, and pushing them to trust one could feel manipulative. We could make the donating itself clear and easy.',
        },
        {
          decision: 'Simulated purchases, not real bank data',
          why: 'We didn’t want to collect anyone’s bank details. The tradeoff: testers worked with fake money, so real stakes would probably make them more cautious.',
        },
        {
          decision: 'Chrome first',
          why: 'It’s the most widely used browser, so it was the one to demo on.',
        },
        {
          decision: 'Test usability, not long-term behaviour',
          why: 'We first wanted to measure whether Aspiration changed how often people give, but that wasn’t realistic in a quarter. So we asked two questions we could answer in a session: does it make donating feel simple, and do people feel informed and in control?',
        },
      ],
      outcome: 'We presented it at the CS 188 final showcase, and our whole team got A’s. It’s still my favorite class I’ve taken.',
      differently: 'I’d start with structured interviews instead of finding out halfway that our first round wasn’t deep enough. And I’d want to test with more people, and over a longer stretch. Four sessions with fake money can tell you if a flow is usable, but not whether people would actually keep donating.',
      numbers: [
        { value: '18 → 13', label: 'Interviews per round', context: 'Semi-structured, then structured' },
        { value: '4', label: 'Usability sessions', context: '1 pilot + 3 full, with UCLA students' },
        { value: '20–30 min', label: 'Per session', context: 'In person, on a laptop' },
        { value: '2', label: 'End-to-end scenarios', context: 'Set up, then a simulated checkout' },
        { value: '3', label: 'Post-task ratings', context: 'Each on a 7-point scale' },
        { value: '10', label: 'Tree growth stages', context: 'From a seed to a forest' },
      ],
      numbersNote: 'From our CS 188 blog post and user research write-ups (Fall 2025). The 80% / 27% / 63% come from our poster’s summary of 30 of the 31 interviews. Purchases in testing were simulated; no real money moved.',
    },
  },
  {
    slug: 'event-pricing',
    title: 'Pricing Student Events With Data',
    section: 'singles',
    tag: 'Analysis',
    role: 'Social chair',
    year: '2025–26',
    oneLiner: 'Ten events of presale data, turned into a pricing strategy.',
    cover: { art: 'pricing', palette: 'citrus' },
    // Every figure comes from my analysis notes and dashboard (kept out of
    // the repo with the raw exports in data/, which hold buyers' personal
    // details). Only aggregated numbers live here, and no money totals:
    // the chapter's finances stay private.
    // The one stat on its card; the full set is on the case study.
    headline: { value: '+40%', label: 'per head' },
    metrics: [
      { label: 'Ladder vs flat $10', value: '+40%' },
      { label: 'Sold in final 48 h', value: '67%' },
      { label: 'Backyard presales', value: '157' },
    ],
    media: [],
    caseStudy: {
      summary: 'I pulled ten events’ worth of presale data together to figure out how to price our tickets.',
      context: [
        'As social chair for my fraternity, Lambda Phi Epsilon, I found pricing was mostly guesswork.',
        'We had about a year of presale forms and payment records, so I put them together to see what actually worked.',
      ],
      role: 'I did the analysis mostly on my own: pulling every event’s forms and payment records together, cleaning them up, and finding the patterns. As social chair and publicity, I also designed the flyers and promoted every event on the chapter’s social media.',
      process: [
        {
          title: 'Pulling it together',
          text: [
            'Every event had a presale form, a payment statement and, for some, a profit sheet. I lined up each purchase with its event and the time it came in, then matched buyers across events by phone number, then by name, to see who came back. Purchases within 10 minutes of each other counted as a group.',
            'One event, Resurrection, was $35 at an outside venue, so I left it out as an outlier. Halloween was guys only, so it’s out of the venue averages. Two events only had part of their pricing on record, Inferno and After Dark 9/25, so their numbers are estimates. And most forms were guys’ presale lists, so the counts mostly reflect guys’ tickets.',
          ],
        },
        {
          title: 'What I found',
          text: 'Four things stood out across the nine events.',
          findings: [
            {
              title: 'Raising the price barely changed turnout',
              text: 'Going from $10 to $18 didn’t shrink the crowd. The venue moved the numbers, not the price.',
              chart: {
                type: 'chartjs',
                kind: 'scatter',
                title: 'Average price paid vs presales, by event',
                note: 'Hover a point for the event; click a venue to hide it. Hollow points are estimates: Inferno is plotted at its $18 tier price. W9 Rager’s count includes girls; Halloween was guys only.',
                events: pricingEvents,
              },
            },
            {
              title: 'Most people buy in the last two days',
              text: 'About two thirds of presales came in the final 48 hours, and nearly half on the last day. After Dark 9/25 sold 76% of its tickets on the last day alone.',
              chart: {
                type: 'chartjs',
                kind: 'cumulative',
                title: 'Share of presales sold by days before the event',
                note: 'Click an event in the legend to hide it. Days are counted back from a 10pm start.',
                events: pricingEvents,
              },
            },
            {
              title: 'Ladders beat flat pricing',
              text: 'Events with a price ladder, where tickets get pricier as the event gets closer, made about 40% more per head than flat $10 ones, with the same size crowd. The higher tiers still sold: at Lost in Lambda, more than half the tickets went at the top $17 tier.',
              chart: {
                type: 'chartjs',
                kind: 'perTicket',
                title: 'Average paid per ticket',
                note: 'Flat $10 events sit at the bottom. Pale bars are estimates: Inferno counts every ticket at its $18 tier, and After Dark 9/25 assumes the first 65 at $10 and the rest at $15.',
                events: pricingEvents,
              },
            },
            {
              title: 'A backyard can draw a frat-house crowd',
              text: 'A frat house reliably draws the biggest crowd, but it costs a lot more than a backyard or a rooftop. After Dark 9/25 drew 157 in a backyard: a frat-house-size crowd at a fraction of the cost.',
              chart: {
                type: 'chartjs',
                kind: 'venue',
                title: 'Average presales by venue',
                note: 'Halloween was guys only, so it’s left out of the frat house average.',
                bars: [
                  { venue: 'frat', label: 'Frat house', value: 163.3 },
                  { venue: 'roof', label: 'Rooftop', value: 67.5 },
                  { venue: 'yard', label: 'Backyard', value: 91 },
                ],
              },
            },
          ],
        },
        {
          title: 'Promotion',
          text: 'Buying peaks on Thursday and Friday evenings, mostly between 7pm and 1am, and Sunday is dead. So that’s when the flyers went out.',
          chart: {
            type: 'chartjs',
            kind: 'days',
            title: 'Purchases by day of the week',
            note: 'All nine events combined, from the form timestamps.',
            bars: [
              { label: 'Mon', name: 'Monday', value: 57 },
              { label: 'Tue', name: 'Tuesday', value: 82 },
              { label: 'Wed', name: 'Wednesday', value: 137 },
              { label: 'Thu', name: 'Thursday', value: 211, highlight: true },
              { label: 'Fri', name: 'Friday', value: 296, highlight: true },
              { label: 'Sat', name: 'Saturday', value: 114 },
              { label: 'Sun', name: 'Sunday', value: 14 },
            ],
          },
        },
      ],
      decisions: [
        {
          decision: 'Backyard or rooftop: $12 → $15 → $20, $25 at the door',
          why: 'Our default. It costs a fraction of a frat house, and the higher tiers haven’t cost us people.',
        },
        {
          decision: 'Frat house, solo: $15 → $18 → $20, $25 at the door',
          why: 'One or two big themed nights a quarter, not the default. A rented house needs real prices, so no $10 tier. Inferno sold 157 at $18.',
        },
        {
          decision: 'Frat house, collab: $12 member / $18 general, $25 at the door',
          why: 'The safest way to get a big venue: splitting it halves the risk, but also the take. Lucid Dream drew 160 at $10 / $14, which was too low for a rented house.',
        },
        {
          decision: 'Go biggest the first weekend of the quarter',
          why: 'After Dark 9/25 was the first weekend of fall, and 89% of its buyers had never bought from us before. That’s the night for the full ladder.',
        },
      ],
      // TODO: update this after the next event (how the new ladder did).
      outcome: 'The findings are getting their first real test now. I’m trying the new price ladders at our upcoming events one at a time and adjusting as I go.',
      differently: 'I’d fix the forms before the analysis. Every event’s form was a little different: one tier’s price was never recorded, one column had no label, and only one form asked how people heard about us. Same fields every time, including each tier’s price and a referral question, would have made all of this faster and more certain.',
      numbers: [
        { value: '10', label: 'Events analyzed', context: 'Nine in the charts; one left out as an outlier' },
        { value: '812', label: 'Different buyers', context: 'Matched across events by phone, then name' },
        { value: '97', label: 'Came to 2+ events', context: 'Out of 812' },
        { value: '40–80%', label: 'Bought in a group', context: 'Per event: purchases within 10 minutes of each other' },
        { value: '81% → 40%', label: 'Group buying, $15 vs $20 tier', context: 'Groups may split up at $20' },
        { value: '~2/3', label: 'Referred by a brother', context: 'Soundwave, the only form that asked' },
      ],
      numbersNote: 'From ten events’ presale forms and payment records (Oct 2025 – Sep 2026). Presales are form submissions, and a few people paid for friends. Money totals are left out on purpose.',
    },
  },

  /* ─── Features ─── */
  {
    slug: 'fraternity-flyers',
    title: 'Fraternity Flyers',
    section: 'features',
    tag: 'Club',
    role: 'Social Chair & Publicity',
    year: '2025–26',
    oneLiner: 'Rush and event flyers for my fraternity, including two collabs.',
    cover: { image: '/work/flyers/cover.webp', alt: 'The LAMBDAS fall rush 2026 flyer', palette: 'plum', layout: 'framed' },
    metrics: [{ label: 'Flyers', value: '6' }],
    media: [
      { type: 'image', src: '/work/flyers/01.webp', alt: 'Flyer: Fall Rush 2026, with the chapter’s name in large type', caption: 'Fall rush 2026', ratio: '4/5' },
      { type: 'image', src: '/work/flyers/02.webp', alt: 'Fall rush 2026 schedule: brotherhood BBQ, basketball tourney, rush event', caption: 'Rush schedule', ratio: '4/5' },
      { type: 'image', src: '/work/flyers/crest.webp', alt: 'The chapter crest: Greek letters over a dragon', caption: 'Chapter logo, designed by me', ratio: '1/1' },
      { type: 'image', src: '/work/flyers/03.webp', alt: 'Flyer: After Dark, Friday 9/25 at 10pm', caption: 'After Dark 9/25', ratio: '4/5' },
      { type: 'image', src: '/work/flyers/04.webp', alt: 'Flyer: After Dark, Friday 1/9 at 10pm', caption: 'After Dark 1/9', ratio: '4/5' },
      { type: 'image', src: '/work/flyers/05.webp', alt: 'Flyer: Drift, with two cars and a halftone texture', caption: 'Drift', ratio: '4/5' },
      { type: 'image', src: '/work/flyers/06.webp', alt: 'Flyer: Soundwave, a collab with another chapter, 4/24 at 10pm', caption: 'Soundwave', ratio: '1279/1600' },
    ],
  },
  {
    slug: 'tsa-creative-media',
    title: 'Taiwanese Student Association',
    section: 'features',
    tag: 'Club',
    role: 'Creative Media Team',
    year: '2025–2026',
    oneLiner: 'Designed 34 board member intros and 3 event graphics over the year.',
    cover: { image: '/work/tsa-creative-media/cover.webp', palette: 'citrus', layout: 'stacked' },
    metrics: [{ label: 'Graphics', value: '37' }],
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
    title: 'SMC Honor Society',
    section: 'features',
    tag: 'Club',
    role: 'Publicity Committee',
    year: '2023–2024',
    oneLiner: 'Event and announcement graphics for the honor society.',
    cover: { image: '/work/smc-honor-society/02.webp', alt: 'General meeting announcement with day and night meeting times', palette: 'plum', layout: 'framed' },
    metrics: [{ label: 'Graphics', value: '3' }],
    media: [
      { type: 'image', src: '/work/smc-honor-society/02.webp', alt: 'General meeting announcement with day and night meeting times', caption: 'General meeting: day & night', ratio: '1/1' },
      { type: 'image', src: '/work/smc-honor-society/04.webp', alt: 'Coming soon teaser for the AGS Fall 2023 banquet, with cartoon eyes', caption: 'Fall banquet teaser', ratio: '1/1' },
      { type: 'image', src: '/work/smc-honor-society/03.webp', alt: 'Black-and-white general meeting announcement with stacked window frames and the society crest', caption: 'General meeting', ratio: '1/1' },
    ],
  },

  /* ─── Deep cuts ─── */
  {
    slug: 'spotify-widgets',
    title: 'Spotify Widgets',
    section: 'deepcuts',
    tag: 'Concept',
    role: 'UI design',
    year: '',
    oneLiner: 'Home-screen widgets for what you are listening to.',
    cover: { image: '/work/spotify-widgets/cover.webp', palette: 'mint', layout: 'framed' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/spotify-widgets/01.webp', alt: 'Four Spotify widget designs in different sizes, all playing ‘Alone in Space’', caption: 'The widget sizes', ratio: '1/1' },
    ],
  },
  {
    slug: 'yellow-theme-challenge',
    title: 'Yellow Theme Challenge (8 Days)',
    section: 'deepcuts',
    tag: 'Challenge',
    role: 'Design',
    year: '',
    oneLiner: 'One colour, eight days.',
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
    title: 'Nintendo Switch Menu Remake',
    section: 'deepcuts',
    tag: 'Remake',
    role: 'UI & motion',
    year: '',
    oneLiner: 'The home menu, rebuilt.',
    cover: { image: '/work/switch-menu-remake/cover.webp', palette: 'sunset', layout: 'framed' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/switch-menu-remake/01.webp', alt: 'A recreated Nintendo Switch home menu: game tiles over a blurred Mario background', caption: 'The home menu', ratio: '16/9' },
    ],
  },

  /* ─── Early work ─── */
  {
    slug: 'ap-art-3d',
    title: 'AP Art 3D',
    section: 'archive',
    tag: 'School',
    role: '3D design',
    year: '2022',
    oneLiner: 'The AP 3D portfolio.',
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
    title: 'High School House T-Shirts',
    section: 'archive',
    tag: 'School',
    role: 'Apparel design',
    year: '2023',
    oneLiner: 'Shirts for the house teams.',
    cover: { image: '/work/house-t-shirts/cover.webp', palette: 'sunset', layout: 'stacked' },
    metrics: [],
    media: [
      { type: 'image', src: '/work/house-t-shirts/01.webp', alt: 'House t-shirt design: Green Dragon house, class of 2023, white line art on green', caption: 'Green Dragon', ratio: '1/1' },
      { type: 'image', src: '/work/house-t-shirts/02.webp', alt: 'House t-shirt design: Red Phoenix house, class of 2023, white line art on red', caption: 'Red Phoenix', ratio: '1/1' },
      { type: 'image', src: '/work/house-t-shirts/03.webp', alt: 'House t-shirt design: White Tiger house, class of 2023, black line art on white', caption: 'White Tiger', ratio: '1/1' },
      { type: 'image', src: '/work/house-t-shirts/04.webp', alt: 'House t-shirt design: Black Turtle house, class of 2023, white line art on black', caption: 'Black Turtle', ratio: '1/1' },
    ],
  },
  {
    slug: 'line-emotes',
    title: 'Line Emotes',
    section: 'archive',
    tag: 'Illustration',
    role: 'Sticker design',
    year: '2023',
    oneLiner: 'A set of sticker emotes.',
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
  lead: 'Small experiments, toys, and things that didn’t make the album.',
  status: 'Coming soon',
}
