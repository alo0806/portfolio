# Project media (`public/work/`)

Everything the My Work page and the case studies show lives here, one
folder per project, named after the project's `slug` in
`src/data/content.js`. Files in `public/` are served from the site root,
so `public/work/this-site/cover.webp` is `/work/this-site/cover.webp` in
`content.js`.

```
public/work/
  this-site/
    cover.webp          the card's cover (square)
    01.webp             gallery / case study images, in order
    02.webp
    clip.mp4            a short looping clip
    clip-poster.webp    its first frame, shown before it plays
  lambda-rush/
    …
```

Keep the original, full-size files outside the project (yours are in
`astnlo.port-originals/`, next to it): everything in `public/` is deployed
and committed, so only the converted WebP files belong here.

## Images

- **WebP**, quality ~80. Keep each file **≤ 300 KB**.
- Width: **1600 px** for gallery and case study images; **1000 × 1000**
  for covers (they're square).
- Give every image an `alt` in `content.js` (what's in it, for screen
  readers) and set `ratio` to its width / height, e.g. `'4/5'` or
  `'16/9'`, so the page doesn't jump while it loads. For a small image
  (an emote, an icon), add `width` (its pixel width) so the gallery never
  enlarges it past 1.5x and blurs it.
- To make WebP: Squoosh (squoosh.app) in the browser, or export from Figma
  as PNG and convert.

## Clips (motion work, rush videos)

- **MP4 (H.264)**, optionally a **WebM** too. Keep each clip **≤ 3 MB**.
- **6–15 seconds**, **no audio** (they always play muted), 1280 px wide
  is plenty. Make the last frame flow into the first: they loop.
- A **poster** for every clip: a WebP of its first frame
  (`clip-poster.webp`, ≤ 100 KB). It shows before the clip loads, and
  instead of autoplay for people who prefer reduced motion.
- Clips play only while they're on screen, and pause off screen, in a
  background tab, and when the site is paused.
- For the whole video (YouTube, Instagram, Drive…), add
  `fullVideo: 'https://…'` to the media item: a "Watch full video" link
  appears on it.

## In `content.js`

```js
media: [
  { type: 'image', src: '/work/this-site/01.webp', alt: 'The tracklist and player bar', caption: 'The first layout.', ratio: '16/10' },
  { type: 'video', src: '/work/lambda-rush/clip.mp4', poster: '/work/lambda-rush/clip-poster.webp', alt: 'Rush video cut-down', ratio: '16/9', fullVideo: 'https://…' },
],
cover: { image: '/work/this-site/cover.webp', alt: '…', palette: 'sunset', layout: 'stacked' },
// or a looping cover: { video: '/work/lambda-rush/clip.mp4', poster: '/work/lambda-rush/clip-poster.webp', palette: 'plum' }
```

Without a cover image or video, the card draws a typographic cover in its
`palette`. A media item with `src: null` shows a coloured placeholder
frame.
