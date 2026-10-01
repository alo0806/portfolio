/* ─────────────────────────────────────────────────────────────
   EVERY SOUND PARAMETER LIVES HERE. Tune freely.

   All tonal sounds come from one key, so moving around the site plays a
   soft, coherent melody. Times are in seconds, gains are 0–1 (before the
   bus level and volume slider), frequencies in Hz.
   ───────────────────────────────────────────────────────────── */

export const SOUND = {
  /* The key everything is in: a major pentatonic in D (D E F# A B).
     Change `root` to transpose the whole site. */
  key: {
    root: 'D',
    scale: [0, 2, 4, 7, 9], // semitones above the root: major pentatonic
  },

  /* The listener's volume slider sits on top of everything, so it turns
     down sound effects and any future background music together.
     `initial` is where it starts for a first-time visitor (0–1); `curve`
     maps the slider to loudness (2 = halfway sounds about half as loud). */
  volume: {
    initial: 0.7,
    curve: 2,
  },

  /* Sound effects bus: its own level under the slider, plus one gentle
     low-pass so nothing can ever come out harsh. */
  sfx: {
    level: 0.22,
    lowpass: 3200,
  },

  /* Background music (the playlist in content.js): its own level under
     the same slider, so music and effects can be balanced here. It
     starts low — background, not a concert. Times in seconds. */
  music: {
    level: 0.35,
    crossfade: 1.0, // overlap between one song and the next
    fadeIn: 0.8, // pressing play
    pauseFade: 0.3, // pressing pause
    skipFade: 0.6, // the "next song" button and picking from the queue
    preloadLead: 20, // start downloading the next song this long before its crossfade
    // "press play" on the intro: the needle and crackle get the stage first;
    // the music comes in this long after the click, fading in gently.
    introDelay: 2.5,
    introFade: 1.5,
  },

  /* Minimum time between two plays of the same sound, in ms, so rapid
     hovering or clicking never becomes a buzz. */
  throttle: {
    note: 45,
    hoverNote: 110,
    click: 70,
    needle: 400,
    crackle: 600,
    tapeStop: 600,
    babble: 250,
    texture: 120,
    preview: 120,
    tap: 70,
    letter: 90,
  },

  /* Tracklist rows: each page has its own note (scale degree + octave).
     Degrees 0,2,3 are D, F#, A — a major triad, so any order of pages
     sounds resolved. */
  tracks: [
    { degree: 0, octave: 4 }, // My Work → D4
    { degree: 2, octave: 4 }, // About Me → F#4
    { degree: 3, octave: 4 }, // Playground → A4
  ],

  /* A plucked, rounded tone: triangle plus a quiet octave overtone. */
  note: {
    type: 'triangle',
    overtone: 0.18, // level of the sine an octave up
    gain: 0.9,
    attack: 0.012,
    decay: 0.55,
    lowpass: 1900,
  },

  /* Hovering a row: the same note, barely there. */
  hoverNote: {
    gainScale: 0.16,
    decay: 0.3,
  },

  /* Prev / next / play: a small mechanical switch. */
  click: {
    noiseGain: 0.35,
    noiseDuration: 0.012,
    bandpass: 2100,
    bandpassQ: 2.5,
    blipFrom: 1500,
    blipTo: 850,
    blipGain: 0.07,
    blipDuration: 0.03,
    noteDelay: 0.05, // the new track's note follows the click by this much
  },

  /* Press play: the needle landing. A low, soft thump. */
  needle: {
    from: 110,
    to: 42,
    sweep: 0.12,
    gain: 0.75,
    decay: 0.24,
    tickGain: 0.12,
  },

  /* Press play: vinyl crackle. Sparse pops over a faint hiss. */
  crackle: {
    duration: 1.0,
    gain: 0.55,
    hiss: 0.05, // level of the continuous hiss inside the texture
    popsPerSecond: 28,
    highpass: 450,
    lowpass: 3600,
    fade: 0.15,
  },

  /* Back to the record: a tape-stop — a chord that slows and sinks. */
  tapeStop: {
    degrees: [0, 3], // root and fifth
    octave: 4,
    drop: 4, // pitch falls to 1/drop
    duration: 0.75,
    gain: 0.45,
    lowpassFrom: 2200,
    lowpassTo: 280,
  },

  /* The mascot talking: one short pitched blip per word. */
  babble: {
    octave: 5,
    blip: 0.06,
    gap: 0.095,
    gain: 0.4,
    bend: 1.06, // each blip slides down from this ratio
    maxWords: 12,
  },

  /* Hovering an album card: a barely-there brush of texture. */
  texture: {
    duration: 0.07,
    gain: 0.05,
    bandpass: 4200,
    bandpassQ: 0.8,
  },

  /* Turning sound on: a tiny rising two-note hello. */
  confirm: {
    degrees: [0, 3],
    octave: 5,
    spacing: 0.08,
  },

  /* Letting go of the volume slider: one soft note at the new level. */
  preview: {
    degree: 0,
    octave: 5,
  },

  /* ─── The intro ─── */

  /* Clicking the intro's backdrop: a random note from the key (never the
     same one twice in a row). Each click adds to `pile`, which drains at
     `drain` per second; the louder the pile, the softer the next note,
     so spam-clicking stays gentle. */
  tap: {
    degrees: [0, 9], // scale degrees to pick from: D4 up to B5
    octave: 4,
    gain: 0.5, // × the plucked note's gain
    decay: 0.7,
    pile: 1,
    drain: 3,
    soften: 0.45, // gain ÷ (1 + pile × soften)
  },

  /* Hovering the letters of the name: one soft note per letter, rising
     through the scale from the first letter to the last. */
  letter: {
    octave: 4,
    gain: 0.22, // × the plucked note's gain
    decay: 0.4,
  },

  /* The quiet vinyl texture under the intro, from the first interaction
     until "press play" (crossfades into the music) or "skip intro". Mostly
     sparse pops over a muffled hiss — not white noise. */
  roomCrackle: {
    gain: 0.5,
    hiss: 0.035,
    popsPerSecond: 7,
    length: 8, // seconds in the loop
    highpass: 160,
    lowpass: 2400,
    fadeIn: 1.4,
    fadeOut: 0.6, // skip intro, leaving, a hidden tab
  },

  /* Scratching the intro record: a short stretch of the first song,
     played at the record's speed (backwards too). One turn of the record
     is 1.8s of audio, like a real 33⅓ rpm disc. */
  scratch: {
    gain: 0.9,
    from: 0.3, // where in the song file the stretch starts (0–1)
    bytes: 512 * 1024, // how much of the file to fetch for it
    seconds: 10, // kept after decoding
    degreesPerSecond: 200, // record speed that plays at normal pitch (33⅓ rpm)
    fadeBelow: 90, // after letting go: fades out as the spin comes within this (deg/s) of idle
    smoothing: 0.012, // seconds; how quickly level and speed follow (no clicks)
  },
}
