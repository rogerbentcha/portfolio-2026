import { ThemeProvider } from 'ferry-ui'
import { LazyMotion } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from '@/router'
import { detectLocale, I18nProvider } from '@/i18n'
import '@/styles/index.css'

const locale = detectLocale()
document.documentElement.lang = locale
const loadAnimationFeatures = () => import('@/lib/motion-features').then((module) => module.default)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="portfolio-theme">
      <I18nProvider locale={locale}>
        <LazyMotion features={loadAnimationFeatures} strict>
          <RouterProvider router={router} />
        </LazyMotion>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
