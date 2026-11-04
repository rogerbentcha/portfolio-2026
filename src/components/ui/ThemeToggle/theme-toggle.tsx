import { Button, useTheme } from 'ferry-ui'
import { Moon, Sun } from 'lucide-react'
import { useI18n } from '@/i18n'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useI18n()
  const dark = resolvedTheme === 'dark'
  const label = dark ? t.theme.light : t.theme.dark
  return (
    <Button
      variant="outline"
      size="icon-lg"
      className="theme-toggle"
      icon={dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      aria-label={label}
      title={label}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    />
  )
}
