import { Button } from 'ferry-ui'
import { Download } from 'lucide-react'
import { useI18n } from '@/i18n'

/** Downloads the CV in the site language. */
export function ResumeDownload() {
  const { t, content } = useI18n()
  return (
    <Button variant="outline" size="lg" className="resume-download" icon={<Download />} asChild>
      <a href={content.resume} download>
        {t.resume}
      </a>
    </Button>
  )
}
