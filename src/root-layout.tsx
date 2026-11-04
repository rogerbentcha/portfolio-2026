import { Outlet, ScrollRestoration } from 'react-router'
import { SiteFooter } from '@/components/layout/SiteFooter/site-footer'
import { SiteNavigation } from '@/components/layout/SiteNavigation/site-navigation'
import { EdgeField } from '@/components/ui/EdgeField/edge-field'
import { ResumeDownload } from '@/components/ui/ResumeDownload/resume-download'
import { ThemeToggle } from '@/components/ui/ThemeToggle/theme-toggle'
import { useSmoothScroll } from '@/hooks/smooth-scroll'
import { useI18n } from '@/i18n'

/** Editorial layout with a fixed Drift header and a fading footer. */
export function RootLayout() {
  const { t } = useI18n()
  useSmoothScroll()
  return (
    <div className="portfolio">
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
