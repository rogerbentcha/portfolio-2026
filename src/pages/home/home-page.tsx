import { Section } from '@/components/ui/section'
import { TimelineEntry } from '@/components/ui/timeline-entry'
import { useI18n } from '@/i18n'
import { ContactSection } from './sections/contact-section'
import { Hero } from './sections/hero'
import { ProjectsSection } from './sections/projects-section'

export function HomePage() {
  const { t, content } = useI18n()
  const { profile, experience, education } = content

  return (
    <>
      <title>{`${profile.firstName} ${profile.lastName}`}</title>
      <meta name="description" content={`${profile.role}. ${profile.intro}`} />

      <Hero />

      <ProjectsSection />

      <Section id="experience" title={t.sections.experience}>
        {experience.map((entry) => (
          <TimelineEntry key={entry.title} entry={entry} />
        ))}
      </Section>

      <Section id="education" title={t.sections.education}>
        {education.map((entry) => (
          <TimelineEntry key={entry.title} entry={entry} />
        ))}
      </Section>

      <ContactSection />
    </>
  )
}
