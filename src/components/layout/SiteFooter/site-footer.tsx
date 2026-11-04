import { EdgeField } from '@/components/ui/EdgeField/edge-field'
import { ThemeToggle } from '@/components/ui/ThemeToggle/theme-toggle'
import { useI18n } from '@/i18n'

const YEAR = new Date().getFullYear()

export function SiteFooter() {
  const { profile } = useI18n().content
  return (
    <footer className="site-footer">
      <EdgeField edge="bottom" />
      <div className="footer-layout">
        <div className="footer-content">
          <span>{profile.location}</span>
          <span>{profile.offScreen}</span>
          <div className="footer-bottom">
            <span>
              © {YEAR} {profile.firstName} {profile.lastName}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
