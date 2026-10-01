import { playlist } from '../data/content'
import { SOUND } from './config'
import { getSfxOutput, isAudible } from './engine'

/* Scratching the intro record.

   A short stretch of the first song is fetched (a byte range from the
   middle of the file — not the whole song), decoded, and played by a tiny
   audio processor whose playhead the record drives: forward, backward,
   fast or slow, like a needle in a real groove. The processor smooths
   speed and level itself, so the sound never clicks, and its level also
   follows the speed (a still record is silent).

   scratchVoice.prepare()   on the first press of the record: load it
   scratchVoice.set(speed, level)   every frame while it should sound:
                            speed in degrees per second (negative is
                            backward), level 0–1
   scratchVoice.silence()   fade out now (press play, skip, leaving)

   The processor's code is written inline and loaded from a Blob URL, so
   there's no extra file to serve. If anything fails (old browser, no
   range support, a decode error) the record still spins — silently. */

const PROCESSOR = `
class ScratchProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.data = null
    this.pos = 0
    this.rate = 0
    this.gain = 0
    this.targetRate = 0
    this.targetGain = 0
    this.step = 1
    this.k = 0.002
    this.port.onmessage = ({ data }) => {
      if (data.samples) {
        this.data = data.samples
        this.step = data.sampleRate / sampleRate
        this.k = 1 - Math.exp(-1 / (data.smoothing * sampleRate))
        this.pos = Math.floor(this.data.length * 0.25)
      } else {
        this.targetRate = data.rate
        this.targetGain = data.gain
      }
    }
  }
  process(inputs, outputs) {
    const out = outputs[0]
    const left = out[0]
    const data = this.data
    if (!data) return true
    const n = data.length
    const k = this.k
    for (let i = 0; i < left.length; i += 1) {
      this.rate += (this.targetRate - this.rate) * k
      this.gain += (this.targetGain - this.gain) * k
      this.pos += this.rate * this.step
      if (this.pos >= n) this.pos -= n
      else if (this.pos < 0) this.pos += n
      const at = Math.floor(this.pos)
      const frac = this.pos - at
      const a = data[at]
      const b = data[at + 1 < n ? at + 1 : 0]
      // A record barely moving is barely audible.
      const motion = Math.min(1, Math.abs(this.rate) * 3)
      left[i] = (a + (b - a) * frac) * this.gain * motion
    }
    for (let c = 1; c < out.length; c += 1) out[c].set(left)
    return true
  }
}
registerProcessor('scratch', ScratchProcessor)
`

let state = 'idle' // idle → loading → ready | failed
let node = null
let connected = false
let offTimer = 0

async function fetchStretch(url) {
  const s = SOUND.scratch
  // Ask for the file's size first (one byte), then the stretch itself.
  const probe = await fetch(url, { headers: { Range: 'bytes=0-0' } })
  const total = Number(probe.headers.get('Content-Range')?.split('/')[1])
  probe.body?.cancel().catch(() => {})
  if (probe.status !== 206 || !Number.isFinite(total)) throw new Error('no range support')
  const start = Math.max(0, Math.min(Math.floor(total * s.from), total - s.bytes))
  const end = Math.min(total - 1, start + s.bytes - 1)
  const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } })
  if (response.status !== 206) throw new Error('no range support')
  return response.arrayBuffer()
}

// Mono, trimmed to the configured length: all the scratch needs.
function toSamples(buffer) {
  const length = Math.min(buffer.length, Math.round(buffer.sampleRate * SOUND.scratch.seconds))
  const samples = new Float32Array(length)
  const channels = buffer.numberOfChannels
  for (let c = 0; c < channels; c += 1) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < length; i += 1) samples[i] += data[i] / channels
  }
  return samples
}

async function load() {
  const output = getSfxOutput()
  const song = playlist[0]
  if (!output || !song?.file || !output.ctx.audioWorklet) throw new Error('unavailable')
  const { ctx } = output
  const url = URL.createObjectURL(new Blob([PROCESSOR], { type: 'text/javascript' }))
  try {
    await ctx.audioWorklet.addModule(url)
  } finally {
    URL.revokeObjectURL(url)
  }
  const decoded = await ctx.decodeAudioData(await fetchStretch(song.file))
  const samples = toSamples(decoded)
  node = new AudioWorkletNode(ctx, 'scratch', { numberOfInputs: 0, outputChannelCount: [2] })
  node.port.postMessage(
    { samples, sampleRate: decoded.sampleRate, smoothing: SOUND.scratch.smoothing },
    [samples.buffer],
  )
}

function connect(on) {
  if (!node || on === connected) return
  const output = getSfxOutput()
  if (!output) return
  if (on) node.connect(output.bus)
  else node.disconnect()
  connected = on
}

// Once it has had time to fade, disconnect it, so it costs nothing idle.
function quiet() {
  if (!connected || offTimer) return
  offTimer = window.setTimeout(() => {
    offTimer = 0
    connect(false)
  }, 300)
}

function loud() {
  window.clearTimeout(offTimer)
  offTimer = 0
  connect(true)
}

export const scratchVoice = {
  /* Call from the press itself (a user gesture). Safe to call again. */
  prepare() {
    if (state !== 'idle') return
    state = 'loading'
    load().then(
      () => {
        state = 'ready'
      },
      () => {
        state = 'failed'
      },
    )
  },

  set(speed, level) {
    if (state !== 'ready') return
    const gain = isAudible() && !document.hidden ? level * SOUND.scratch.gain : 0
    if (gain > 0) loud()
    else quiet()
    if (connected) node.port.postMessage({ rate: speed / SOUND.scratch.degreesPerSecond, gain })
  },

  silence() {
    if (state !== 'ready' || !connected) return
    node.port.postMessage({ rate: 0, gain: 0 })
    quiet()
  },
}
