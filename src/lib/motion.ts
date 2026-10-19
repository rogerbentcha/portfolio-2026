import { stagger, useReducedMotion, type MotionProps, type Variants } from 'motion/react'

const textStagger: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(0.1) } },
}

const textReveal: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] },
  },
}

const staticText: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
}

const fadeReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] },
  },
}

/** Reveal semantic text blocks once in view; reduced motion shows all text immediately. */
export function useTextEntrance() {
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion
  const itemVariants = reducedMotion ? staticText : textReveal
  const trigger: MotionProps = {
    initial: animate ? 'hidden' : false,
    animate: reducedMotion ? 'visible' : undefined,
    whileInView: animate ? 'visible' : undefined,
    viewport: { once: true, amount: 0.12 },
  }

  return {
    group: { ...trigger, variants: animate ? textStagger : undefined },
    item: { variants: itemVariants },
    fadeItem: { variants: reducedMotion ? staticText : fadeReveal },
    single: { ...trigger, variants: itemVariants },
  }
}
