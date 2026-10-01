import { useEffect, useId, useRef, useState } from 'react'
import { mascotLines, nowPlaying } from '../../data/content'
import useReducedMotion from '../../hooks/useReducedMotion'
import { isIdle, onIdleChange } from '../../lib/idle'
import { onFrame } from '../../lib/ticker'
import { beat } from '../../sound/beat'
import { SOUND } from '../../sound/config'
import { sound } from '../../sound/engine'
import { getMusic, useMusic } from '../../sound/music'
import { usePlayer } from '../player/playerContext'
import '../Mascot.css'
import './CassetteMascot.css'
import {
  BODY,
  EXPRESSIONS,
  FOOT,
  HAND_R,
  JOINTS,
  KEYS,
  LEG,
  ARM,
  LOOK,
  REEL_R,
  REELS,
  VIEW_H,
  VIEW_W,
  clamp,
  flipAction,
  holdAction,
  idlePose,
  jumpAction,
  lerpPose,
  limb,
  pausedPose,
  toWorld,
  vibePose,
  waveAction,
} from './rig'

// Updates per second: 60 while it's dancing, acting or following the
// cursor; 30 for the slow, small motions (breathing, dangling, dozing).
const FRAME = 1000 / 60
const CALM_FRAME = 1000 / 30
const BLEND = 0.14 // seconds: how quickly one state eases into another
const JUMP_S = 0.6
const FLIP_S = 1.1
const BUBBLE_MS = 3200
const DROWSY_AFTER = 8 // seconds paused before the lids droop
const ASLEEP_AFTER = 22 // … and before it falls asleep
const BASES = ['idle', 'vibing', 'paused']

// Lines name whatever is playing right now (or the placeholder).
function lineAt(index) {
  const song = getMusic().song
  return mascotLines[index]
    .replace('{song}', song?.title ?? nowPlaying.song)
    .replace('{artist}', song?.artist ?? nowPlaying.artist)
}

/* The cassette buddy: a cream tape with an orange "alo" label, whose two
   reels are its eyes, and rubber-hose arms and legs. It moves with its
   limbs and weight (no squash): breathing, leaning toward the cursor,
   dancing to the music's real beat (sound/beat.js), sitting on the ledge
   when the music is paused and dozing off, flipping over like a tape
   when the song changes, waving on hover, jumping when clicked, holding
   up its speech bubble while it talks.

   Every frame's pose is computed in rig.js and written straight to the
   SVG (attributes and transforms) from the shared ticker — at most 60
   times a second, only while it's on screen, and it comes to rest (and
   stops ticking) after 10s without input and under reduced motion.

   Props:
   - size: height in px of the whole figure's box (the cassette is about
     half of it; arms and legs need the rest)
   - align: which way the speech bubble opens ('center' | 'end')
   - base: force 'idle' | 'vibing' | 'paused' | 'asleep' (the review
     page); otherwise it follows the player
   - expression: 'happy' | 'surprised' | 'sleepy' | null
   - cue: { name, id } — a new id plays that action once ('look',
     'songChange', 'hover', 'click', 'talking') */
export default function CassetteMascot({ size = 52, align = 'center', base, expression = null, cue }) {
  const reduced = useReducedMotion()
  const { playing } = usePlayer()
  const music = useMusic()
  const uid = useId().replace(/:/g, '')
  const [line, setLine] = useState('')
  const [side, setSide] = useState('A')

  const svgRef = useRef(null)
  const api = useRef({})
  const hideTimerRef = useRef(0)
  const hoverTimerRef = useRef(0)
  const lastLineRef = useRef(-1)

  // The state the outside world asks for, read by the frame loop.
  const autoBase = music.available && music.playing ? 'vibing' : playing ? 'idle' : 'paused'
  const wanted = useRef({ base: base ?? autoBase, expression, reduced })
  useEffect(() => {
    wanted.current = { base: base ?? autoBase, expression, reduced }
    api.current.wake?.()
  }, [base, autoBase, expression, reduced])

  const say = () => {
    let index = Math.floor(Math.random() * mascotLines.length)
    if (index === lastLineRef.current) index = (index + 1) % mascotLines.length
    lastLineRef.current = index
    const text = lineAt(index)
    setLine(text)
    sound.babble(text)
    api.current.talk?.(text)
    window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => {
      setLine('')
      api.current.stopTalking?.()
    }, BUBBLE_MS)
  }

  /* ─── The frame loop ─── */
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return undefined
    // The moving parts, by their data-el names.
    const el = {}
    svg.querySelectorAll('[data-el]').forEach((node) => {
      el[node.dataset.el] = node
    })

    const start = performance.now()
    let last = 0
    let stopTicking = null
    let visible = false
    let idle = isIdle()
    let energy = wanted.current.reduced ? 0 : 1

    // Blend weights for the base states and the expressions.
    const baseW = { idle: 0, vibing: 0, paused: 0 }
    baseW[BASES.includes(wanted.current.base) ? wanted.current.base : 'paused'] = 1
    const exprW = { happy: 0, surprised: 0, sleepy: 0 }

    // Actions in progress: { started, weight }.
    const actions = {}
    let hovering = false
    let talkUntil = 0
    let talkingWords = 0
    let pausedSince = wanted.current.base === 'paused' ? start : 0
    let sleep = wanted.current.base === 'asleep' ? 1 : 0
    let blinkAt = start + 2000
    let spinAngle = [0, 0]
    let flipped = false
    let releaseBeat = null

    // Pointer, in page px; the svg's box, re-read now and then.
    let px = null
    let py = null
    let lookAt = null // a scripted target while the 'look' cue plays
    let box = null
    let boxAt = 0
    const look = { x: 0, y: 0, lean: 0 }
    const lookGoal = { x: 0, y: 0 }
    let previous = null
    let stillFrames = 0
    let lively = true // needs the full rate this frame

    const written = new Map()
    const write = (node, attr, value) => {
      if (!node) return
      let byNode = written.get(node)
      if (!byNode) written.set(node, (byNode = {}))
      if (byNode[attr] === value) return
      byNode[attr] = value
      node.setAttribute(attr, value)
    }

    const ease = (dt, seconds) => 1 - Math.exp(-dt / seconds)

    const render = (pose, dt) => {
      write(el.body, 'transform', `translate(${pose.cx.toFixed(2)} ${pose.cy.toFixed(2)}) rotate(${pose.rot.toFixed(2)} 0 ${BODY.h / 2}) scale(${pose.sx.toFixed(3)} 1)`)
      const shoulderL = toWorld(pose, JOINTS.shoulderL)
      const shoulderR = toWorld(pose, JOINTS.shoulderR)
      const hipL = toWorld(pose, JOINTS.hipL)
      const hipR = toWorld(pose, JOINTS.hipR)
      const handL = [pose.cx + pose.hlx, pose.cy + pose.hly]
      const handR = [pose.cx + pose.hrx, pose.cy + pose.hry]
      const footL = [pose.flx, pose.fly]
      const footR = [pose.frx, pose.fry]
      const paths = {
        armL: limb(shoulderL, handL, ARM, pose.cx),
        armR: limb(shoulderR, handR, ARM, pose.cx),
        legL: limb(hipL, footL, LEG, pose.cx),
        legR: limb(hipR, footR, LEG, pose.cx),
      }
      for (const [name, d] of Object.entries(paths)) {
        write(el[name], 'd', d)
        write(el[`${name}Halo`], 'd', d)
      }
      write(el.handL, 'transform', `translate(${handL[0].toFixed(2)} ${handL[1].toFixed(2)})`)
      write(el.handR, 'transform', `translate(${handR[0].toFixed(2)} ${handR[1].toFixed(2)})`)
      write(el.footL, 'transform', `translate(${(footL[0] - FOOT.out).toFixed(2)} ${footL[1].toFixed(2)})`)
      write(el.footR, 'transform', `translate(${(footR[0] + FOOT.out).toFixed(2)} ${footR[1].toFixed(2)})`)

      // Reels: look, size, squint into ^ ^, spin.
      const ox = (pose.lx * LOOK[0]).toFixed(2)
      const oy = (pose.ly * LOOK[1]).toFixed(2)
      const squash = 1 - 0.85 * pose.happy
      REELS.forEach(([rx, ry], i) => {
        spinAngle[i] = (spinAngle[i] + pose.spin * 360 * dt * (i === 0 ? 1 : 1.06)) % 360
        const reel = i === 0 ? el.reelL : el.reelR
        const face = i === 0 ? el.faceL : el.faceR
        const hub = i === 0 ? el.hubL : el.hubR
        const lid = i === 0 ? el.lidL : el.lidR
        write(reel, 'transform', `translate(${ox} ${oy})`)
        write(lid, 'transform', `translate(${ox} ${oy})`)
        write(face, 'transform', `translate(${rx} ${ry}) scale(${pose.reel.toFixed(3)} ${(pose.reel * squash).toFixed(3)}) translate(${-rx} ${-ry})`)
        write(face, 'opacity', (1 - pose.happy).toFixed(3))
        write(hub, 'transform', `rotate(${spinAngle[i].toFixed(1)} ${rx} ${ry})`)
        write(i === 0 ? el.lidShapeL : el.lidShapeR, 'transform', `translate(0 ${(clamp(pose.lid) * (REEL_R * 2 + 0.8)).toFixed(2)})`)
      })
      write(el.happy, 'opacity', pose.happy.toFixed(3))
      // Fully shut: a closed-eye curve over the lids.
      write(el.closed, 'opacity', clamp((pose.lid - 0.85) / 0.15).toFixed(3))
      write(el.closed, 'transform', `translate(${ox} ${oy})`)
      write(el.happy, 'transform', `translate(${ox} ${oy})`)
      write(el.mSmile, 'opacity', clamp(pose.mSmile).toFixed(3))
      write(el.mOpen, 'opacity', clamp(pose.mOpen).toFixed(3))
      write(el.mO, 'opacity', clamp(pose.mO).toFixed(3))
      write(el.mFlat, 'opacity', clamp(pose.mFlat).toFixed(3))
      write(el.zz, 'opacity', clamp(pose.zz).toFixed(3))
    }

    const readBox = (now) => {
      if (!box || now - boxAt > 500) {
        const rect = svg.getBoundingClientRect()
        box = { left: rect.left, top: rect.top, ppu: rect.height / VIEW_H }
        boxAt = now
      }
    }

    const compose = (now, dt) => {
      const w = wanted.current
      const t = (now - start) / 1000
      const rm = w.reduced
      const blend = rm ? 1 : ease(dt, BLEND)

      // Energy: 1 normally; 0 at rest (10s without input, reduced motion).
      energy += ((idle || rm ? 0 : 1) - energy) * (rm ? 1 : ease(dt, 0.4))
      if (energy < 0.002) energy = 0
      const e = energy

      // Base state weights.
      const baseName = w.base === 'asleep' ? 'paused' : w.base
      for (const name of BASES) baseW[name] += ((name === baseName ? 1 : 0) - baseW[name]) * blend

      // Paused: drowsy, then asleep (straight to sleep when nobody's around).
      if (baseName === 'paused') {
        if (!pausedSince) pausedSince = now
        const seconds = (now - pausedSince) / 1000
        const goal = w.base === 'asleep' || idle ? 1 : seconds > ASLEEP_AFTER ? 1 : seconds > DROWSY_AFTER ? 0.5 : 0
        sleep += (goal - sleep) * (rm ? 1 : Math.min(1, dt * (goal > sleep ? 0.9 : 3)))
      } else {
        pausedSince = 0
        sleep += (0 - sleep) * (rm ? 1 : Math.min(1, dt * 3))
      }

      // The beat, while dancing.
      if (baseW.vibing > 0.001 && !releaseBeat) releaseBeat = beat.acquire()
      if (baseW.vibing <= 0.001 && releaseBeat) {
        releaseBeat()
        releaseBeat = null
      }
      const b = beat.at(now).beat

      let pose = null
      let total = 0
      for (const name of BASES) {
        const weight = baseW[name]
        if (weight < 0.001) continue
        const p =
          name === 'idle' ? idlePose(t, e) : name === 'vibing' ? vibePose(rm ? 0 : b, e) : pausedPose(t, sleep, e)
        total += weight
        pose = pose ? lerpPose(pose, p, weight / total) : p
      }

      // Actions.
      const act = (name, active, layer, seconds = 0.12) => {
        const a = actions[name] ?? (actions[name] = { weight: 0, started: 0 })
        a.weight += ((active ? 1 : 0) - a.weight) * (rm ? 1 : ease(dt, seconds))
        if (a.weight < 0.002) a.weight = 0
        if (a.weight > 0) pose = lerpPose(pose, layer(pose), a.weight)
      }
      const jump = actions.click?.started ? (now - actions.click.started) / 1000 / JUMP_S : 2
      const flip = actions.songChange?.started ? (now - actions.songChange.started) / 1000 / FLIP_S : 2
      if (flip < 1 && flip >= 0.4 && !flipped) {
        flipped = true
        setSide((s) => (s === 'A' ? 'B' : 'A'))
      }
      act('songChange', flip < 1 && !rm, (p) => flipAction(p, clamp(flip)), 0.04)
      act('click', jump < 1 && !rm, (p) => jumpAction(p, clamp(jump)), 0.04)
      act('hover', hovering, (p) => waveAction(p, rm ? 0 : t))
      const talking = now < talkUntil ? 1 : 0
      const words = talkingWords * SOUND.babble.gap
      const sinceTalk = talkUntil ? (now - (talkUntil - BUBBLE_MS)) / 1000 : 99
      const mouth = !rm && sinceTalk < words ? 0.5 + 0.5 * Math.sin((sinceTalk * Math.PI * 2) / (SOUND.babble.gap * 2)) : 0.25
      act('talking', talking && jump >= 1, (p) => holdAction(p, rm ? 0 : t, mouth), 0.18)

      // Looking: the reels follow the cursor (or the scripted target); far
      // to one side, the body leans that way too.
      readBox(now)
      const target = lookAt ? lookAt(now) : px === null ? null : [px, py]
      let tx = 0
      let ty = 0
      let lean = 0
      if (target && box && sleep < 0.9 && !rm) {
        const eyeX = box.left + pose.cx * box.ppu
        const eyeY = box.top + (pose.cy + 3) * box.ppu
        const dx = target[0] - eyeX
        const dy = target[1] - eyeY
        const d = Math.hypot(dx, dy) || 1
        const reach = Math.min(d / 140, 1)
        tx = (dx / d) * reach
        ty = (dy / d) * reach
        lean = Math.sign(dx) * clamp((Math.abs(dx) - 260) / 600) * 4
      }
      lookGoal.x = tx
      lookGoal.y = ty
      const follow = rm ? 1 : ease(dt, 0.07)
      look.x += (tx - look.x) * follow
      look.y += (ty - look.y) * follow
      look.lean += (lean * (1 - sleep) - look.lean) * (rm ? 1 : ease(dt, 0.35))
      pose = { ...pose, lx: pose.lx + look.x, ly: pose.ly + look.y, rot: pose.rot + look.lean * pose.sx }
      pose.cx += look.lean * 0.3

      // Expressions.
      for (const name of Object.keys(exprW)) {
        exprW[name] += ((w.expression === name ? 1 : 0) - exprW[name]) * blend
        if (exprW[name] > 0.002) pose = lerpPose(pose, EXPRESSIONS[name](pose), exprW[name])
      }
      // Blinks (not while asleep, startled or at rest).
      if (!rm && e > 0.5 && sleep < 0.9) {
        const since = now - blinkAt
        if (since > 0 && since < 150) pose.lid = Math.max(pose.lid, Math.sin((since / 150) * Math.PI))
        else if (since >= 150) blinkAt = now + 2600 + Math.random() * 3800
      }
      return pose
    }

    // Has anything still got to move?
    const busy = (now) =>
      energy > 0 ||
      hovering ||
      now < talkUntil ||
      (actions.click?.started && now - actions.click.started < JUMP_S * 1000 + 400) ||
      (actions.songChange?.started && now - actions.songChange.started < FLIP_S * 1000 + 400) ||
      Boolean(lookAt)

    const tick = (now) => {
      if (!visible) {
        stopTicking = null
        return false
      }
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
      if (last && now - last < (lively ? FRAME : CALM_FRAME) - 1) return true
      last = now
      const pose = compose(now, dt)
      render(pose, dt)

      // Settled and nothing driving it: stop until something changes.
      let moved = 0
      if (previous) for (const key of KEYS) moved = Math.max(moved, Math.abs(pose[key] - previous[key]))
      previous = pose
      stillFrames = moved < 0.004 ? stillFrames + 1 : 0
      lively =
        baseW.vibing > 0.01 ||
        hovering ||
        now < talkUntil ||
        Object.values(actions).some((a) => a.weight > 0) ||
        Math.abs(look.x - lookGoal.x) + Math.abs(look.y - lookGoal.y) > 0.01 ||
        Boolean(lookAt)
      if (!busy(now) && stillFrames > 2) {
        stopTicking = null
        last = 0
        return false
      }
      return true
    }

    const wake = () => {
      if (!visible || stopTicking) return
      stillFrames = 0
      stopTicking = onFrame(tick)
    }

    api.current = {
      wake,
      play(name) {
        const now = performance.now()
        if (name === 'songChange') {
          flipped = false
          ;(actions.songChange ??= { weight: 0, started: 0 }).started = now
          if (wanted.current.reduced) setSide((s) => (s === 'A' ? 'B' : 'A'))
        } else if (name === 'click') {
          ;(actions.click ??= { weight: 0, started: 0 }).started = now
        } else if (name === 'look') {
          const until = now + 4200
          const points = [
            [-0.9, -0.1],
            [0.9, -0.3],
            [-0.4, -0.9],
            [0.5, 0.6],
          ]
          lookAt = (time) => {
            if (time > until) {
              lookAt = null
              return null
            }
            const i = Math.min(points.length - 1, Math.floor(((time - (until - 4200)) / 4200) * points.length))
            const rect = box ?? { left: 0, top: 0, ppu: 1 }
            const span = Math.max(window.innerWidth, 900)
            return [rect.left + points[i][0] * span, rect.top + points[i][1] * 400]
          }
        }
        wake()
      },
      hover(on) {
        hovering = on
        wake()
      },
      talk(text) {
        talkingWords = Math.min(text.split(/\s+/).length, SOUND.babble.maxWords)
        talkUntil = performance.now() + BUBBLE_MS
        wake()
      },
      stopTalking() {
        talkUntil = 0
        wake()
      },
    }

    const onMove = (event) => {
      px = event.clientX
      py = event.clientY
      wake()
    }
    const onScroll = () => {
      box = null
    }
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      box = null
      wake()
    })
    seen.observe(svg)
    // Draw a first pose straight away, so it's never seen unposed (the
    // loop itself only runs once it's on screen).
    render(compose(start, 1 / 60), 0)
    const stopIdle = onIdleChange((value) => {
      idle = value
      wake()
    })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)

    return () => {
      stopTicking?.()
      releaseBeat?.()
      seen.disconnect()
      stopIdle()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
      api.current = {}
    }
  }, [])

  // A new song: turn the tape over.
  const songIndex = music.available ? music.index : -1
  const lastSong = useRef(songIndex)
  useEffect(() => {
    if (lastSong.current !== songIndex && lastSong.current !== -1 && songIndex !== -1) {
      api.current.play?.('songChange')
    }
    lastSong.current = songIndex
  }, [songIndex])

  const onClick = () => {
    api.current.play?.('click')
    say()
  }

  // The review page's buttons.
  useEffect(() => {
    if (!cue) return
    if (cue.name === 'talking') say()
    else if (cue.name === 'click') onClick()
    else if (cue.name === 'hover') {
      api.current.hover?.(true)
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = window.setTimeout(() => api.current.hover?.(false), 2200)
    } else api.current.play?.(cue.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue?.id])

  useEffect(
    () => () => {
      window.clearTimeout(hideTimerRef.current)
      window.clearTimeout(hoverTimerRef.current)
    },
    [],
  )

  // Strokes stay at least ~1.5px however small it's drawn.
  const ppu = size / VIEW_H
  const strokes = {
    '--cs-limb': Math.max(2.1, 1.6 / ppu).toFixed(2),
    '--cs-line': Math.max(1.1, 1.05 / ppu).toFixed(2),
    '--cs-fine': Math.max(0.7, 0.75 / ppu).toFixed(2),
  }
  const clip = (i) => `cs-${uid}-lid-${i}`
  const [[lx, ly], [rx, ry]] = REELS

  return (
    <div className="mascot cassette" data-align={align} style={{ '--mascot': `${(size * VIEW_W) / VIEW_H}px` }}>
      <p className="mascot__bubble" role="status" data-show={line ? 'true' : 'false'}>
        {line}
      </p>
      <button
        type="button"
        className="mascot__button cassette__button"
        aria-label="Say hi to the cassette"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') api.current.hover?.(true)
        }}
        onPointerLeave={() => api.current.hover?.(false)}
        onClick={onClick}
      >
        <svg
          ref={svgRef}
          className="cassette__svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={(size * VIEW_W) / VIEW_H}
          height={size}
          style={strokes}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {REELS.map(([cx, cy], i) => (
              <clipPath key={i} id={clip(i)}>
                <circle cx={cx} cy={cy} r={REEL_R + 0.4} />
              </clipPath>
            ))}
          </defs>

          {/* Limbs behind the body. */}
          <g className="cs-limbs">
            <g data-part="leg-left">
              <path data-el="legLHalo" className="cs-halo" />
              <path data-el="legL" className="cs-limb" />
              <ellipse data-el="footL" className="cs-foot" rx={FOOT.rx} ry={FOOT.ry} />
            </g>
            <g data-part="leg-right">
              <path data-el="legRHalo" className="cs-halo" />
              <path data-el="legR" className="cs-limb" />
              <ellipse data-el="footR" className="cs-foot" rx={FOOT.rx} ry={FOOT.ry} />
            </g>
            <g data-part="arm-left">
              <path data-el="armLHalo" className="cs-halo" />
              <path data-el="armL" className="cs-limb" />
              <circle data-el="handL" className="cs-hand" r={HAND_R} />
            </g>
            <g data-part="arm-right">
              <path data-el="armRHalo" className="cs-halo" />
              <path data-el="armR" className="cs-limb" />
              <circle data-el="handR" className="cs-hand" r={HAND_R} />
            </g>
          </g>

          <g data-el="body" data-part="cassette">
            <g data-part="body">
              <rect
                className="cs-shell"
                x={-BODY.w / 2}
                y={-BODY.h / 2}
                width={BODY.w}
                height={BODY.h}
                rx={BODY.r}
              />
              {[
                [-24.5, -13.8],
                [24.5, -13.8],
                [-24.5, 13.8],
                [24.5, 13.8],
              ].map(([x, y]) => (
                <circle key={`${x}${y}`} className="cs-screw" cx={x} cy={y} r="0.9" />
              ))}
            </g>

            <g data-part="label">
              <rect className="cs-label" x="-22" y="-15" width="44" height="9.5" rx="2.2" />
              <text className="cs-label-text" x="0" y="-7.7" textAnchor="middle">
                alo
              </text>
              <text className="cs-side" x="18.2" y="-8.2" textAnchor="middle">
                {side}
              </text>
            </g>

            <g data-part="window">
              <rect className="cs-window" x="-17" y="-3.4" width="34" height="12.8" rx="3.4" />
              <path className="cs-tape" d={`M${lx} ${ly + REEL_R - 0.6} L${rx} ${ry + REEL_R - 0.6}`} />
            </g>

            {REELS.map(([cx, cy], i) => (
              <g key={`reel${i}`} data-el={i === 0 ? 'reelL' : 'reelR'} data-part={i === 0 ? 'reel-left' : 'reel-right'}>
                <g data-el={i === 0 ? 'faceL' : 'faceR'}>
                  <circle className="cs-reel" cx={cx} cy={cy} r={REEL_R} />
                  <g data-el={i === 0 ? 'hubL' : 'hubR'}>
                    <circle className="cs-hub" cx={cx} cy={cy} r="2.3" />
                    {[0, 60, 120, 180, 240, 300].map((a) => (
                      <rect
                        key={a}
                        className="cs-tooth"
                        x={cx - 0.45}
                        y={cy - 2.3}
                        width="0.9"
                        height="1.1"
                        transform={`rotate(${a} ${cx} ${cy})`}
                      />
                    ))}
                  </g>
                </g>
              </g>
            ))}

            {REELS.map(([cx, cy], i) => (
              <g
                key={`lid${i}`}
                data-el={i === 0 ? 'lidL' : 'lidR'}
                data-part={i === 0 ? 'lid-left' : 'lid-right'}
                clipPath={`url(#${clip(i)})`}
              >
                <g data-el={i === 0 ? 'lidShapeL' : 'lidShapeR'}>
                  {/* Rests just above the reel (out of its clip); closing
                      slides it down over it. */}
                  <rect
                    className="cs-lid"
                    x={cx - REEL_R - 1}
                    y={cy - REEL_R * 3 - 2.6}
                    width={REEL_R * 2 + 2}
                    height={REEL_R * 2 + 2}
                  />
                  <path
                    className="cs-lid-edge"
                    d={`M${cx - REEL_R - 1} ${cy - REEL_R - 0.6}H${cx + REEL_R + 1}`}
                  />
                </g>
              </g>
            ))}

            <g data-el="closed" data-part="closed-eyes" opacity="0">
              {REELS.map(([cx, cy]) => (
                <path key={cx} className="cs-caret" d={`M${cx - 3.4} ${cy + 0.4}Q${cx} ${cy + 3} ${cx + 3.4} ${cy + 0.4}`} />
              ))}
            </g>

            <g data-el="happy" data-part="happy-eyes" opacity="0">
              {REELS.map(([cx, cy]) => (
                <path key={cx} className="cs-caret" d={`M${cx - 3.6} ${cy + 1.6}Q${cx} ${cy - 3.6} ${cx + 3.6} ${cy + 1.6}`} />
              ))}
            </g>

            <g data-part="mouth">
              <path className="cs-notch" d="M-12 17.5L-9.6 12H9.6L12 17.5" />
              <path data-el="mSmile" className="cs-mouth" d="M-2.6 14.1Q0 16.4 2.6 14.1" />
              <path data-el="mOpen" className="cs-mouth cs-mouth--fill" d="M-2.8 13.8Q0 17.6 2.8 13.8Z" opacity="0" />
              <ellipse data-el="mO" className="cs-mouth cs-mouth--fill" cx="0" cy="14.9" rx="1.3" ry="1.6" opacity="0" />
              <path data-el="mFlat" className="cs-mouth" d="M-2.2 14.9H2.2" opacity="0" />
            </g>

            <g data-el="zz" data-part="zz" opacity="0">
              <text className="cs-zz" x="27" y="-19">z</text>
              <text className="cs-zz cs-zz--small" x="32" y="-25">z</text>
            </g>
          </g>
        </svg>
      </button>
    </div>
  )
}
