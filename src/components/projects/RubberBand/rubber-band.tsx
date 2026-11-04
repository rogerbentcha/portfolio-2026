import * as animation from 'motion/react-m'
import type { MotionProps } from 'motion/react'
import { useRubberBand, type UseRubberBandOptions } from './use-rubber-band'

interface RubberBandProps extends UseRubberBandOptions {
  entrance?: MotionProps
}

/** Connect a hovered project to its preview with a WebGPU band that bends and rebounds. */
export function RubberBand({ entrance, ...options }: RubberBandProps) {
  const { overlayRef, canvasRef, svgRef, pathRef, status } = useRubberBand(options)
  const { activeKey } = options

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
