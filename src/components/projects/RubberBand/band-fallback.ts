import { pointAt, type Band } from './band-physics'

export interface FallbackElements {
  path: SVGPathElement
  circles: NodeListOf<SVGCircleElement>
}

/** Draw the band into the SVG fallback when WebGPU is unavailable or not ready. */
export function drawFallback({ path, circles }: FallbackElements, band: Band, color: string) {
  const points = Array.from({ length: 41 }, (_, index) => pointAt(band, index / 40))
  path.setAttribute(
    'd',
    points
      .map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
      .join(' '),
  )
  path.setAttribute('stroke', color)
  for (const [index, point] of [band.start, band.end].entries()) {
    circles[index]?.setAttribute('cx', String(point.x))
    circles[index]?.setAttribute('cy', String(point.y))
    circles[index]?.setAttribute('fill', color)
  }
}
