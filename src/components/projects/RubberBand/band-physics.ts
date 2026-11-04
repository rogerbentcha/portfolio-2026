import { advance, clamp, isMoving, snap, spring, type Spring } from './spring'

export type Point = { x: number; y: number }
export type PointerSample = Point & { time: number }

/** Fixed simulation step, in seconds. */
export const STEP = 1 / 120

/** Mutable state of the band: its anchors, control points and bend springs. */
export interface Band {
  start: Point
  end: Point
  controls: [Spring, Spring, Spring, Spring]
  pull: Spring
  pullPosition: Spring
  pluck: Spring
  phase: number
}

export const createBand = (): Band => ({
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
  controls: [spring(), spring(), spring(), spring()],
  pull: spring(),
  pullPosition: spring(0.5),
  pluck: spring(),
  phase: 0,
})

const springsOf = (band: Band) => [...band.controls, band.pull, band.pullPosition, band.pluck]

/** Point at `t` on the bent curve; mirrors `curvePoint` in the shader. */
export function pointAt(band: Band, t: number): Point {
  const { start, end, controls, pull, pullPosition, pluck, phase } = band
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

/** Advance every spring and the wave phase by one fixed step. */
export function stepBand(band: Band) {
  for (const [index, value] of band.controls.entries())
    advance(value, STEP, index < 2 ? 210 : 165, 18)
  advance(band.pull, STEP, 230, 21)
  advance(band.pullPosition, STEP, 260, 25)
  advance(band.pluck, STEP, 95, 8)
  band.phase = (band.phase + 11 / 120) % (Math.PI * 2)
}

export const isBandMoving = (band: Band) => springsOf(band).some(isMoving)

export const settleBand = (band: Band) => springsOf(band).forEach(snap)

/** Set the anchors and aim the control points at a sagging curve. Returns the sag. */
export function anchorBand(band: Band, start: Point, end: Point) {
  band.start = start
  band.end = end
  const dx = end.x - start.x
  const dy = end.y - start.y
  const sag = clamp(Math.abs(dx) * 0.13, 18, 58)
  band.controls[0].target = start.x + dx * 0.33
  band.controls[1].target = start.y + dy * 0.23 + sag
  band.controls[2].target = start.x + dx * 0.7
  band.controls[3].target = start.y + dy * 0.77 + sag
  return sag
}

/** Place the band at rest, then lift it so it drops in with a small wave. */
export function introduceBand(band: Band, sag: number, animate: boolean) {
  band.controls.forEach(snap)
  if (!animate) return
  band.controls[1].value -= sag
  band.controls[3].value -= sag
  band.pluck.value = 8
}

/** Twang the band when it jumps to another project. */
export function pluckBand(band: Band) {
  const dy = band.end.y - band.start.y
  band.pluck.velocity += clamp(dy, -100, 100) * 1.8 + 85
  band.pull.target = 0
}

/** Drop any pointer bend and wave. */
export function resetBand(band: Band) {
  band.pull.value = band.pull.target = band.pull.velocity = 0
  band.pluck.value = band.pluck.target = band.pluck.velocity = 0
}

/** Bend the band toward a nearby pointer and pluck it with the pointer's speed. */
export function bendBand(band: Band, pointer: PointerSample, previous: PointerSample | null) {
  const { start, end } = band
  let nearest = Infinity
  let closest = 0.5
  let point: Point = start
  for (let index = 2; index <= 30; index += 1) {
    const t = index / 32
    const sample = pointAt(band, t)
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
  band.pull.target = clamp(offset * influence * 0.55, -42, 42)
  if (influence > 0) band.pullPosition.target = closest
  if (previous && influence > 0) {
    const seconds = Math.max(1 / 240, (pointer.time - previous.time) / 1000)
    const speed = ((pointer.x - previous.x) * -dy + (pointer.y - previous.y) * dx) / length / seconds
    band.pluck.velocity += clamp(speed * influence * 0.025, -28, 28)
  }
}
