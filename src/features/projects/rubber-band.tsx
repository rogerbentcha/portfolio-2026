import { useEffect, useRef, useState, type RefObject } from 'react'
import * as animation from 'motion/react-m'
import type { MotionProps } from 'motion/react'
import {
  defineShader,
  mountShader,
  type ShaderController,
  type ShaderStatus,
} from 'ferry-shaders/core'

type Point = { x: number; y: number }
type Spring = { value: number; velocity: number; target: number }

interface RubberBandProps {
  hostRef: RefObject<HTMLDivElement | null>
  startRef: RefObject<HTMLSpanElement | null>
  endRef: RefObject<HTMLSpanElement | null>
  activeKey: string | null
  color: string
  entrance?: MotionProps
}

const numberParam = (label: string, value = 0) => ({
  type: 'number' as const,
  label,
  default: value,
  min: -4096,
  max: 4096,
  step: 0.01,
})

const bandShader = defineShader({
  id: 'project-rubber-band',
  name: 'Project rubber band',
  technique: 'Elastic curve distance',
  description: 'A fine, elastic connector between a project and its preview.',
  pointerEffect: 'Bend and pluck the band by moving close to it.',
  resolution: 'device',
  params: {
    tint: { type: 'color', label: 'Project color', default: '#646cff' },
    startX: numberParam('Start x'),
    startY: numberParam('Start y'),
    endX: numberParam('End x'),
    endY: numberParam('End y'),
    controlAX: numberParam('First control x'),
    controlAY: numberParam('First control y'),
    controlBX: numberParam('Second control x'),
    controlBY: numberParam('Second control y'),
    pull: numberParam('Pointer bend'),
    pullPosition: numberParam('Pointer position', 0.5),
    pluck: numberParam('Wave amplitude'),
    wavePhase: numberParam('Wave phase'),
    opacity: numberParam('Opacity'),
  },
  fragment: /* wgsl */ `
    fn curvePoint(t: f32) -> vec2f {
      let a = vec2f(u.startX, u.startY);
      let b = vec2f(u.endX, u.endY);
      let ca = vec2f(u.controlAX, u.controlAY);
      let cb = vec2f(u.controlBX, u.controlBY);
      let one = 1.0 - t;
      let base = one * one * one * a + 3.0 * one * one * t * ca
        + 3.0 * one * t * t * cb + t * t * t * b;
      let chord = b - a;
      let normal = vec2f(-chord.y, chord.x) / max(length(chord), 1.0);
      let envelope = sin(3.14159265 * t);
      let delta = (t - u.pullPosition) / 0.2;
      let local = exp(-delta * delta);
      let wave = u.pluck * envelope * sin(6.2831853 * t - u.wavePhase);
      return base + normal * (u.pull * local * envelope + wave);
    }

    fn segmentDistance(p: vec2f, a: vec2f, b: vec2f) -> f32 {
      let chord = b - a;
      let amount = clamp(dot(p - a, chord) / max(dot(chord, chord), 0.001), 0.0, 1.0);
      return length(p - a - amount * chord);
    }

    @fragment
    fn fs_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
      let px = position.xy / u.pixelRatio;
      let a = vec2f(u.startX, u.startY);
      let b = vec2f(u.endX, u.endY);
      let ca = vec2f(u.controlAX, u.controlAY);
      let cb = vec2f(u.controlBX, u.controlBY);
      let margin = abs(u.pull) + abs(u.pluck) + 5.0;
      let low = min(min(a, b), min(ca, cb)) - vec2f(margin);
      let high = max(max(a, b), max(ca, cb)) + vec2f(margin);
      if (u.opacity < 0.001 || any(px < low) || any(px > high)) {
        return vec4f(0.0);
      }
      var nearest = 100000.0;
      var previous = a;
      for (var i = 1u; i <= 40u; i = i + 1u) {
        let next = curvePoint(f32(i) / 40.0);
        nearest = min(nearest, segmentDistance(px, previous, next));
        previous = next;
      }
      let feather = 0.8 / u.pixelRatio;
      let line = 1.0 - smoothstep(0.9 - feather, 0.9 + feather, nearest);
      let dots = 1.0 - smoothstep(3.1 - feather, 3.1 + feather, min(length(px - a), length(px - b)));
      let alpha = max(line, dots) * u.tint.a * u.opacity;
      return vec4f(u.tint.rgb * alpha, alpha);
    }
  `,
})

const spring = (value = 0): Spring => ({ value, velocity: 0, target: value })
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

function advance(value: Spring, seconds: number, stiffness = 185, damping = 18) {
  value.velocity += ((value.target - value.value) * stiffness - value.velocity * damping) * seconds
  value.value += value.velocity * seconds
}

function snap(value: Spring) {
  value.value = value.target
  value.velocity = 0
}

/** Connect a hovered project to its preview with a WebGPU band that bends and rebounds. */
export function RubberBand({
  hostRef,
  startRef,
  endRef,
  activeKey,
  color,
  entrance,
}: RubberBandProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const refreshRef = useRef<(() => void) | null>(null)
  const configRef = useRef({ activeKey, color })
  const [status, setStatus] = useState<ShaderStatus>('pending')

  useEffect(() => {
    const host = hostRef.current
    const overlay = overlayRef.current
    const canvas = canvasRef.current
    const svg = svgRef.current
    const path = pathRef.current
    if (!host || !overlay || !canvas || !svg || !path) return

    const aborter = new AbortController()
    const { signal } = aborter
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const circles = svg.querySelectorAll('circle')
    const controls = [spring(), spring(), spring(), spring()]
    const pull = spring()
    const pullPosition = spring(0.5)
    const pluck = spring()
    const springs = [...controls, pull, pullPosition, pluck]
    let start: Point = { x: 0, y: 0 }
    let end: Point = { x: 0, y: 0 }
    let bounds = host.getBoundingClientRect()
    let initialized = false
    let lastKey: string | null = null
    let phase = 0
    let frame = 0
    let previousTime = 0
    let accumulator = 0
    let inView = true
    let displayed = false
    let reducedMotion = motion.matches
    let rendererStatus: ShaderStatus = 'pending'
    let controller: ShaderController | null = null
    let lastPointer: { x: number; y: number; time: number } | null = null
    let observedStart: Element | null = null
    let observedEnd: Element | null = null

    const pointAt = (t: number): Point => {
      const one = 1 - t
      const dx = end.x - start.x
      const dy = end.y - start.y
      const length = Math.max(1, Math.hypot(dx, dy))
      const envelope = Math.sin(Math.PI * t)
      const local = Math.exp(-(((t - pullPosition.value) / 0.2) ** 2))
      const displacement =
        pull.value * local * envelope + pluck.value * envelope * Math.sin(Math.PI * 2 * t - phase)
      return {
        x:
          one ** 3 * start.x +
          3 * one ** 2 * t * controls[0].value +
          3 * one * t ** 2 * controls[2].value +
          t ** 3 * end.x -
          (dy / length) * displacement,
        y:
          one ** 3 * start.y +
          3 * one ** 2 * t * controls[1].value +
          3 * one * t ** 2 * controls[3].value +
          t ** 3 * end.y +
          (dx / length) * displacement,
      }
    }

    const drawFallback = () => {
      const points = Array.from({ length: 41 }, (_, index) => pointAt(index / 40))
      path.setAttribute(
        'd',
        points
          .map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
          .join(' '),
      )
      path.setAttribute('stroke', configRef.current.color)
      for (const [index, point] of [start, end].entries()) {
        circles[index]?.setAttribute('cx', String(point.x))
        circles[index]?.setAttribute('cy', String(point.y))
        circles[index]?.setAttribute('fill', configRef.current.color)
      }
    }

    const mountRenderer = () => {
      if (controller) return
      controller = mountShader(canvas, {
        shader: bandShader,
        paused: true,
        params: { opacity: 0 },
        onStatusChange: (next) => {
          if (signal.aborted) return
          rendererStatus = next
          setStatus(next)
          if (next !== 'ready' && initialized) drawFallback()
        },
      })
    }

    const draw = () => {
      if (!initialized || !displayed) return
      if (rendererStatus !== 'ready') drawFallback()
      controller?.update({
        params: {
          tint: configRef.current.color,
          startX: start.x,
          startY: start.y,
          endX: end.x,
          endY: end.y,
          controlAX: controls[0].value,
          controlAY: controls[1].value,
          controlBX: controls[2].value,
          controlBY: controls[3].value,
          pull: pull.value,
          pullPosition: pullPosition.value,
          pluck: pluck.value,
          wavePhase: phase,
          opacity: 1,
        },
      })
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      accumulator = 0
    }

    const canAnimate = () =>
      initialized && displayed && !!configRef.current.activeKey && inView && !document.hidden

    const tick = (now: number) => {
      frame = 0
      if (!canAnimate()) return
      accumulator += previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60
      previousTime = now
      while (accumulator >= 1 / 120) {
        for (const [index, value] of controls.entries())
          advance(value, 1 / 120, index < 2 ? 210 : 165, 18)
        advance(pull, 1 / 120, 230, 21)
        advance(pullPosition, 1 / 120, 260, 25)
        advance(pluck, 1 / 120, 95, 8)
        phase = (phase + 11 / 120) % (Math.PI * 2)
        accumulator -= 1 / 120
      }
      const moving = springs.some(
        (value) => Math.abs(value.target - value.value) > 0.025 || Math.abs(value.velocity) > 0.12,
      )
      if (!moving) springs.forEach(snap)
      draw()
      if (moving) frame = requestAnimationFrame(tick)
      else previousTime = 0
    }

    const wake = () => {
      if (!canAnimate()) return
      if (reducedMotion) {
        springs.forEach(snap)
        draw()
      } else if (!frame) {
        previousTime = 0
        frame = requestAnimationFrame(tick)
      }
    }

    const sizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => refresh())

    const measure = () => {
      const startElement = startRef.current
      const endElement = endRef.current
      displayed = !!overlay.offsetWidth
      if (!configRef.current.activeKey || !startElement || !endElement || !displayed) return false
      bounds = host.getBoundingClientRect()
      const first = startElement.getBoundingClientRect()
      const second = endElement.getBoundingClientRect()
      if (!bounds.width || !bounds.height || !first.width || !second.width) return false
      start = {
        x: first.left + first.width / 2 - bounds.left,
        y: first.top + first.height / 2 - bounds.top,
      }
      end = {
        x: second.left + second.width / 2 - bounds.left,
        y: second.top + second.height / 2 - bounds.top,
      }
      svg.setAttribute('viewBox', `0 0 ${host.clientWidth} ${host.clientHeight}`)
      const dx = end.x - start.x
      const dy = end.y - start.y
      const sag = clamp(Math.abs(dx) * 0.13, 18, 58)
      controls[0].target = start.x + dx * 0.33
      controls[1].target = start.y + dy * 0.23 + sag
      controls[2].target = start.x + dx * 0.7
      controls[3].target = start.y + dy * 0.77 + sag
      if (!initialized) {
        controls.forEach(snap)
        if (!reducedMotion) {
          controls[1].value -= sag
          controls[3].value -= sag
          pluck.value = 8
        }
        initialized = true
      } else if (lastKey && lastKey !== configRef.current.activeKey && !reducedMotion) {
        pluck.velocity += clamp(dy, -100, 100) * 1.8 + 85
        pull.target = 0
        lastPointer = null
      }
      lastKey = configRef.current.activeKey
      for (const [element, previous] of [
        [startElement, observedStart],
        [endElement, observedEnd],
      ] as const) {
        if (element !== previous) {
          if (previous) sizes?.unobserve(previous)
          sizes?.observe(element)
        }
      }
      observedStart = startElement
      observedEnd = endElement
      return true
    }

    const refresh = () => {
      displayed = !!overlay.offsetWidth
      if (!displayed) {
        stop()
        initialized = false
        lastKey = null
        lastPointer = null
        controller?.dispose()
        controller = null
        rendererStatus = 'pending'
        setStatus('pending')
        return
      }
      if (!configRef.current.activeKey) {
        stop()
        initialized = false
        lastKey = null
        lastPointer = null
        pull.value = pull.target = pull.velocity = 0
        pluck.value = pluck.target = pluck.velocity = 0
        return
      }
      if (!measure()) {
        stop()
        return
      }
      mountRenderer()
      draw()
      wake()
    }

    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion || !canAnimate()) return
      if (!frame && !measure()) return
      const pointer = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        time: event.timeStamp,
      }
      let nearest = Infinity
      let closest = 0.5
      let point: Point = start
      for (let index = 2; index <= 30; index += 1) {
        const t = index / 32
        const sample = pointAt(t)
        const distance = Math.hypot(pointer.x - sample.x, pointer.y - sample.y)
        if (distance < nearest) {
          nearest = distance
          closest = t
          point = sample
        }
      }
      const dx = end.x - start.x
      const dy = end.y - start.y
      const length = Math.max(1, Math.hypot(dx, dy))
      const influence = clamp(1 - nearest / 90, 0, 1)
      const offset = ((pointer.x - point.x) * -dy + (pointer.y - point.y) * dx) / length
      pull.target = clamp(offset * influence * 0.55, -42, 42)
      if (influence > 0) pullPosition.target = closest
      if (lastPointer && influence > 0) {
        const seconds = Math.max(1 / 240, (pointer.time - lastPointer.time) / 1000)
        const speed =
          ((pointer.x - lastPointer.x) * -dy + (pointer.y - lastPointer.y) * dx) / length / seconds
        pluck.velocity += clamp(speed * influence * 0.025, -28, 28)
      }
      lastPointer = pointer
      wake()
    }

    const release = () => {
      lastPointer = null
      pull.target = 0
      wake()
    }

    refreshRef.current = refresh
    // Entrance transforms move the anchors without triggering ResizeObserver.
    const entranceChanges = new MutationObserver((records) => {
      if (records.some(({ target }) => !overlay.contains(target))) refresh()
    })
    entranceChanges.observe(host, { attributes: true, subtree: true, attributeFilter: ['style'] })
    sizes?.observe(host)
    sizes?.observe(overlay)
    host.addEventListener('pointermove', pointerMove, { passive: true, signal })
    host.addEventListener('pointerleave', release, { signal })
    host.addEventListener('pointercancel', release, { signal })
    window.addEventListener('resize', refresh, { passive: true, signal })
    window.addEventListener(
      'scroll',
      () => {
        if (!frame) refresh()
      },
      { passive: true, capture: true, signal },
    )
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) stop()
        else refresh()
      },
      { signal },
    )
    motion.addEventListener(
      'change',
      (event) => {
        reducedMotion = event.matches
        pull.target = 0
        pluck.target = 0
        stop()
        refresh()
      },
      { signal },
    )
    const views =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry?.isIntersecting ?? true
            if (inView) refresh()
            else stop()
          })
    views?.observe(host)
    void document.fonts.ready.then(() => {
      if (!signal.aborted) refresh()
    })
    refresh()

    return () => {
      aborter.abort()
      stop()
      sizes?.disconnect()
      entranceChanges.disconnect()
      views?.disconnect()
      controller?.dispose()
      refreshRef.current = null
    }
  }, [hostRef, startRef, endRef])

  useEffect(() => {
    configRef.current = { activeKey, color }
    refreshRef.current?.()
  }, [activeKey, color])

  return (
    <animation.div
      {...entrance}
      ref={overlayRef}
      className="project-band"
      aria-hidden="true"
      data-state={status}
      style={{ visibility: activeKey ? 'visible' : 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        className="project-band-canvas"
        style={{ visibility: activeKey && status === 'ready' ? 'visible' : 'hidden' }}
      />
      <svg
        ref={svgRef}
        className="project-band-fallback"
        width="100%"
        height="100%"
        style={{ visibility: activeKey && status !== 'ready' ? 'visible' : 'hidden' }}
      >
        <path ref={pathRef} fill="none" strokeWidth="1.8" strokeLinecap="round" />
        <circle r="3.1" />
        <circle r="3.1" />
      </svg>
    </animation.div>
  )
}
