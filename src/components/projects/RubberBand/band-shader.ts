import { defineShader } from 'ferry-shaders/core'
import type { Band } from './band-physics'

const numberParam = (label: string, value = 0) => ({
  type: 'number' as const,
  label,
  default: value,
  min: -4096,
  max: 4096,
  step: 0.01,
})

export const bandShader = defineShader({
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

/** Shader uniforms for the current band state. */
export const bandShaderParams = (band: Band, tint: string) => ({
  tint,
  startX: band.start.x,
  startY: band.start.y,
  endX: band.end.x,
  endY: band.end.y,
  controlAX: band.controls[0].value,
  controlAY: band.controls[1].value,
  controlBX: band.controls[2].value,
  controlBY: band.controls[3].value,
  pull: band.pull.value,
  pullPosition: band.pullPosition.value,
  pluck: band.pluck.value,
  wavePhase: band.phase,
  opacity: 1,
})
