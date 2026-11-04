export type Spring = { value: number; velocity: number; target: number }

export const spring = (value = 0): Spring => ({ value, velocity: 0, target: value })

export const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))

/** Move a spring one step toward its target. */
export function advance(value: Spring, seconds: number, stiffness = 185, damping = 18) {
  value.velocity += ((value.target - value.value) * stiffness - value.velocity * damping) * seconds
  value.value += value.velocity * seconds
}

/** Jump a spring to its target and stop it. */
export function snap(value: Spring) {
  value.value = value.target
  value.velocity = 0
}

export const isMoving = (value: Spring) =>
  Math.abs(value.target - value.value) > 0.025 || Math.abs(value.velocity) > 0.12
