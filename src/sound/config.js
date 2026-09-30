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
    skipFade: 0.6, // the "next song" button
  },

  /* Audio-reactive visuals: how the music is split into three bands and
     turned into motion. Band edges in Hz; `gain` evens the bands out
     (higher bands carry less energy). Smoothing rates are per second:
     higher = snappier. */
  analysis: {
    fftSize: 1024,
    bands: {
      bass: [40, 160],
      mids: [250, 2000],
      highs: [2000, 8000],
    },
    gain: { bass: 1.1, mids: 1.5, highs: 2.6 },
    attack: 22,
    release: 7,
    reducedRate: 2, // prefers-reduced-motion: slow, no bounce
    /* A beat is bass jumping `threshold`× above its recent average
       (averaged over `window` s), at least `floor` loud, no sooner than
       `cooldown` s after the last one. The pulse then fades over `decay` s. */
    beat: { threshold: 1.3, floor: 0.22, window: 1.2, cooldown: 0.22, decay: 0.2 },
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
    scratch: 300,
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

  /* Wrong resume code: a record scratch. The band (and a low swoop
     under it) rises for `turn` of the duration, then falls back. */
  scratch: {
    duration: 0.24,
    turn: 0.35,
    noiseGain: 0.5,
    bandFrom: 500,
    bandPeak: 2600,
    bandTo: 420,
    bandpassQ: 3,
    pitchFrom: 150,
    pitchPeak: 360,
    pitchTo: 110,
    pitchGain: 0.16,
    pitchLowpass: 1200,
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
}
