import { useEffect, useRef, useState, type RefObject } from 'react'
import { mountShader, type ShaderController, type ShaderStatus } from 'ferry-shaders/core'
import { drawFallback } from './band-fallback'
import {
  STEP,
  anchorBand,
  bendBand,
  createBand,
  introduceBand,
  isBandMoving,
  pluckBand,
  resetBand,
  settleBand,
  stepBand,
  type Point,
  type PointerSample,
} from './band-physics'
import { bandShader, bandShaderParams } from './band-shader'

export interface UseRubberBandOptions {
  hostRef: RefObject<HTMLDivElement | null>
  startRef: RefObject<HTMLSpanElement | null>
  endRef: RefObject<HTMLSpanElement | null>
  activeKey: string | null
  color: string
}

const centerIn = (rect: DOMRect, bounds: DOMRect): Point => ({
  x: rect.left + rect.width / 2 - bounds.left,
  y: rect.top + rect.height / 2 - bounds.top,
})

/**
 * Drive the rubber band between two anchors: measure them, run the spring
 * simulation and render it with WebGPU, or with the SVG fallback.
 */
export function useRubberBand({ hostRef, startRef, endRef, activeKey, color }: UseRubberBandOptions) {
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
    const fallback = { path, circles: svg.querySelectorAll('circle') }
    const band = createBand()
    let bounds = host.getBoundingClientRect()
    let initialized = false
    let lastKey: string | null = null
    let frame = 0
    let previousTime = 0
    let accumulator = 0
    let inView = true
    let displayed = false
    let reducedMotion = motion.matches
    let rendererStatus: ShaderStatus = 'pending'
    let controller: ShaderController | null = null
    let lastPointer: PointerSample | null = null
    let observedStart: Element | null = null
    let observedEnd: Element | null = null

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
          if (next !== 'ready' && initialized) drawFallback(fallback, band, configRef.current.color)
        },
      })
    }

    const draw = () => {
      if (!initialized || !displayed) return
      if (rendererStatus !== 'ready') drawFallback(fallback, band, configRef.current.color)
      controller?.update({ params: bandShaderParams(band, configRef.current.color) })
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
      while (accumulator >= STEP) {
        stepBand(band)
        accumulator -= STEP
      }
      const moving = isBandMoving(band)
      if (!moving) settleBand(band)
      draw()
      if (moving) frame = requestAnimationFrame(tick)
      else previousTime = 0
    }

    const wake = () => {
      if (!canAnimate()) return
      if (reducedMotion) {
        settleBand(band)
        draw()
      } else if (!frame) {
        previousTime = 0
        frame = requestAnimationFrame(tick)
      }
    }

    const sizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => refresh())

    const observeAnchors = (startElement: Element, endElement: Element) => {
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
    }

    const measure = () => {
      const startElement = startRef.current
      const endElement = endRef.current
      displayed = !!overlay.offsetWidth
      if (!configRef.current.activeKey || !startElement || !endElement || !displayed) return false
      bounds = host.getBoundingClientRect()
      const first = startElement.getBoundingClientRect()
      const second = endElement.getBoundingClientRect()
      if (!bounds.width || !bounds.height || !first.width || !second.width) return false
      svg.setAttribute('viewBox', `0 0 ${host.clientWidth} ${host.clientHeight}`)
      const sag = anchorBand(band, centerIn(first, bounds), centerIn(second, bounds))
      if (!initialized) {
        introduceBand(band, sag, !reducedMotion)
        initialized = true
      } else if (lastKey && lastKey !== configRef.current.activeKey && !reducedMotion) {
        pluckBand(band)
        lastPointer = null
      }
      lastKey = configRef.current.activeKey
      observeAnchors(startElement, endElement)
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
        resetBand(band)
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
      bendBand(band, pointer, lastPointer)
      lastPointer = pointer
      wake()
    }

    const release = () => {
      lastPointer = null
      band.pull.target = 0
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
        band.pull.target = 0
        band.pluck.target = 0
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

  return { overlayRef, canvasRef, svgRef, pathRef, status }
}
