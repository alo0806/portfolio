import { useEffect, useRef, useState } from 'react'
import CassetteMascot from '../components/cassette/CassetteMascot'
import { VIEW_H, VIEW_W } from '../components/cassette/rig'
import { usePlayer } from '../components/player/playerContext'
import { isIdle, onIdleChange } from '../lib/idle'
import { onFrame } from '../lib/ticker'
import { beat } from '../sound/beat'
import { skip, useMusic } from '../sound/music'
import './SoundLab.css'
import './MascotLab.css'

/* Dev-only (/mascot): the cassette buddy, for reviewing changes to it.
   Every state, action and expression has a button; "Play music" runs
   the real player, so vibing follows the real beat tracker.
   It's shown large and at its real player-bar size, on paper and on
   indigo, standing on (or sitting at the edge of) a mock player bar. */

const BASES = [
  { value: null, label: 'Auto', detail: 'follows the player' },
  { value: 'idle', label: 'Idle', detail: 'breathing, weight shifts' },
  { value: 'vibing', label: 'Vibing', detail: 'grooves to the beat (seated) or dances (standing)' },
  { value: 'paused', label: 'Paused', detail: 'sits on the edge, sleepy; asleep at 22s' },
  { value: 'asleep', label: 'Asleep', detail: 'skip straight to sleep' },
]
const ACTIONS = [
  { name: 'look', label: 'Look', detail: 'looks around (or move your cursor)' },
  { name: 'songChange', label: 'Song change', detail: 'tape flip; the arrow turns around' },
  { name: 'waveLeft', label: 'Wave (left arm)', detail: 'or hover its left side' },
  { name: 'waveRight', label: 'Wave (right arm)', detail: 'or hover its right side' },
  { name: 'click', label: 'Click', detail: 'startled jump, then talks' },
  { name: 'talking', label: 'Talking', detail: 'holds up the bubble' },
]
const EXPRESSIONS = [
  { value: null, label: 'None' },
  { value: 'happy', label: 'Happy' },
  { value: 'surprised', label: 'Surprised' },
  { value: 'sleepy', label: 'Sleepy' },
]
const STAGES = [
  { size: 'large', surface: 'light', title: 'Large · paper' },
  { size: 'large', surface: 'dark', title: 'Large · indigo' },
  { size: 68, surface: 'light', title: 'Player bar · paper', align: 'end' },
  { size: 68, surface: 'dark', title: 'Player bar · indigo', align: 'end' },
  { size: 40, surface: 'light', title: 'Smallest (40px) · paper' },
]

// The mascot's ground line sits this far above the bottom of its box
// (the button's 4px padding plus the viewBox below the ground).
const groundOffset = (size) => 4 + (size * 3) / VIEW_H

/* The tracker's view: tempo, whether it has locked on, and a dot that
   flashes on every beat. Written straight to the DOM while music plays. */
function BeatReadout({ on }) {
  const textRef = useRef(null)
  const dotRef = useRef(null)
  useEffect(() => {
    if (!on) return undefined
    const release = beat.acquire()
    let shown = ''
    let stop = null
    const tick = () => {
      const { beat: b, bpm, locked } = beat.at()
      const f = b - Math.floor(b)
      dotRef.current.style.opacity = String(Math.max(0.15, 1 - f * 3))
      const text = `${bpm.toFixed(1)} bpm · ${locked ? 'locked on' : 'listening… (site tempo)'} · beat ${Math.floor(b)}`
      if (text !== shown) textRef.current.textContent = shown = text
    }
    // Rests with everything else after 10s without input.
    const sync = (idle) => {
      if (idle && stop) {
        stop()
        stop = null
      } else if (!idle && !stop) stop = onFrame(tick)
    }
    sync(isIdle())
    const stopIdle = onIdleChange(sync)
    return () => {
      stop?.()
      stopIdle()
      release()
    }
  }, [on])
  return (
    <p className="mlab__beat">
      <span className="mlab__dot" ref={dotRef} aria-hidden="true" />
      <span ref={textRef}>{on ? 'listening…' : 'music off'}</span>
    </p>
  )
}

/* A plain copy of one mascot for Figma: every part a named group (its id),
   colours and stroke widths written in, nothing site-specific left. */
function exportSvg(svg) {
  const clone = svg.cloneNode(true)
  const from = [svg, ...svg.querySelectorAll('*')]
  const to = [clone, ...clone.querySelectorAll('*')]
  const PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-weight']
  from.forEach((node, i) => {
    const copy = to[i]
    const style = getComputedStyle(node)
    if (style.display === 'none') {
      copy.remove()
      return
    }
    if (node !== svg && !['defs', 'clipPath'].includes(node.tagName)) {
      PROPS.forEach((prop) => {
        const value = style.getPropertyValue(prop)
        if (value && !(prop === 'opacity' && value === '1')) copy.setAttribute(prop, value)
      })
    }
    if (node.dataset?.part) copy.setAttribute('id', node.dataset.part)
    copy.removeAttribute('class')
    copy.removeAttribute('style')
    copy.removeAttribute('data-el')
    copy.removeAttribute('data-part')
  })
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(VIEW_W * 4))
  clone.setAttribute('height', String(VIEW_H * 4))
  clone.removeAttribute('aria-hidden')
  clone.removeAttribute('focusable')
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'cassette-mascot.svg'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function MascotLab() {
  const { musicOn, toggle } = usePlayer()
  const music = useMusic()
  const [base, setBase] = useState(null)
  const [expression, setExpression] = useState(null)
  const [seated, setSeated] = useState(true)
  const [cue, setCue] = useState(null)
  const exportRef = useRef(null)
  // Large is 300px tall, or 220px on a phone so it fits the column.
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const onChange = (event) => setNarrow(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  const px = (size) => (size === 'large' ? (narrow ? 220 : 300) : size)

  useEffect(() => {
    document.title = 'Mascot lab — Austin Lo'
  }, [])

  const play = (name) => setCue((current) => ({ name, id: (current?.id ?? 0) + 1 }))

  return (
    <main id="main" className="lab mlab">
      <header className="lab__head">
        <p className="lab__tag">Dev only</p>
        <h1 className="lab__title">Mascot lab</h1>
        <p className="lab__meta">
          The cassette buddy, round 1. Drawing, skeleton and poses: <code>src/components/cassette/</code>
        </p>
      </header>

      <section className="mlab__controls" aria-label="Controls">
        <div className="mlab__row">
          <h2 className="mlab__label">State</h2>
          <div className="mlab__chips">
            {BASES.map((item) => (
              <button
                key={item.label}
                type="button"
                className="mlab__chip"
                aria-pressed={base === item.value}
                title={item.detail}
                onClick={() => setBase(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mlab__row">
          <h2 className="mlab__label">Posture</h2>
          <div className="mlab__chips">
            <button type="button" className="mlab__chip" aria-pressed={seated} onClick={() => setSeated(true)}>
              Seated (the site)
            </button>
            <button type="button" className="mlab__chip" aria-pressed={!seated} onClick={() => setSeated(false)}>
              Standing
            </button>
          </div>
        </div>
        <div className="mlab__row">
          <h2 className="mlab__label">Actions</h2>
          <div className="mlab__chips">
            {ACTIONS.map((item) => (
              <button key={item.name} type="button" className="mlab__chip" title={item.detail} onClick={() => play(item.name)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mlab__row">
          <h2 className="mlab__label">Expression</h2>
          <div className="mlab__chips">
            {EXPRESSIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="mlab__chip"
                aria-pressed={expression === item.value}
                onClick={() => setExpression(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mlab__row">
          <h2 className="mlab__label">Music</h2>
          <div className="mlab__chips">
            <button type="button" className="mlab__chip" aria-pressed={musicOn} onClick={toggle}>
              {musicOn ? 'Pause music' : 'Play music'}
            </button>
            <button type="button" className="mlab__chip" onClick={skip} disabled={!music.available}>
              Next song
            </button>
            <button type="button" className="mlab__chip" onClick={() => exportSvg(exportRef.current.querySelector('svg'))}>
              Export SVG
            </button>
          </div>
          <BeatReadout on={musicOn} />
        </div>
      </section>

      <div className="mlab__stages">
        {STAGES.map((stage) => (
          <figure
            key={stage.title}
            className="mlab__stage"
            data-surface={stage.surface}
            data-size={stage.size === 'large' ? 'large' : 'small'}
            ref={stage.size === 'large' && stage.surface === 'light' ? exportRef : undefined}
          >
            <figcaption className="mlab__caption">{stage.title}</figcaption>
            <div className="mlab__scene">
              <div className="mlab__mascot" style={{ bottom: `calc(var(--bar) - ${groundOffset(px(stage.size))}px)` }}>
                <CassetteMascot
                  size={px(stage.size)}
                  align={stage.align ?? 'center'}
                  seated={seated}
                  base={base ?? undefined}
                  expression={expression}
                  cue={cue}
                />
              </div>
              <div className="mlab__bar" aria-hidden="true" />
            </div>
          </figure>
        ))}
      </div>
    </main>
  )
}
