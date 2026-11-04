import { Drift } from 'ferry-shaders'

/** Dithered Drift clouds that fade from the document edges. */
export function EdgeField({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <Drift
      className={`edge-field edge-field--${edge}`}
      color="color-mix(in srgb, var(--foreground) 13%, transparent)"
      midColor="color-mix(in srgb, var(--primary-bright) 40%, transparent)"
      background="transparent"
      intensity={0.7}
      glow={0.12}
      speed={1.5}
      fps={30}
      fallback={<div className="edge-field-fallback" />}
    />
  )
}
