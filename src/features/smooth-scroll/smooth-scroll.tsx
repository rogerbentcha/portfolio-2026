import Lenis from 'lenis'
import { useEffect } from 'react'
import { useLocation } from 'react-router'

export function SmoothScroll() {
  const { pathname } = useLocation()

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.1,
      stopInertiaOnNavigate: true,
    })

    return () => lenis.destroy()
  }, [pathname])

  return null
}
