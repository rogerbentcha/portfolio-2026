import { Outlet, ScrollRestoration } from 'react-router'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteNavigation } from '@/components/layout/site-navigation'
import { EdgeField } from '@/features/edge-field/edge-field'
import { ResumeDownload } from '@/components/ui/resume-download'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SmoothScroll } from '@/features/smooth-scroll/smooth-scroll'
import { useI18n } from '@/i18n'

/** Editorial layout with a fixed Drift header and a fading footer. */
export function RootLayout() {
  const { t } = useI18n()
  return (
    <div className="portfolio">
      <SmoothScroll />
      <EdgeField edge="top" />
      <div className="page-theme-control">
        <ThemeToggle />
      </div>
      <div className="page-resume-control">
        <ResumeDownload />
      </div>
      <a className="skip-link" href="#main">
        {t.navigation.skip}
      </a>
      <div className="portfolio-layout">
        <SiteNavigation />
        <div className="portfolio-column">
          <main id="main" className="portfolio-main">
            <Outlet />
          </main>
        </div>
      </div>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  )
}
