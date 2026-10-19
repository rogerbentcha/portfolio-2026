import * as motion from 'motion/react-m'
import { Section } from '@/components/ui/section'
import { TextLink } from '@/components/ui/text-link'
import { useI18n } from '@/i18n'
import { useTextEntrance } from '@/lib/motion'

export function ContactSection() {
  const { t, content } = useI18n()
  const entrance = useTextEntrance()
  return (
    <Section id="contact" title={t.sections.contact}>
      <motion.p {...entrance.single} className="m-0">
        {content.contact.pitch}
      </motion.p>

      <motion.ul {...entrance.group} className="m-0 flex list-none flex-col p-0">
        {content.contact.links.map((link) => (
          <motion.li key={link.label} {...entrance.item} className="flex items-baseline">
            <span>{link.label}</span>
            <TextLink
              href={link.href}
              className={link.href.startsWith('mailto:') ? 'email-link' : undefined}
            >
              {link.href.startsWith('mailto:') ? (
                <>
                  <span className="email-mask" aria-hidden="true">
                    ••••••••@••••••••••
                  </span>
                  <span className="email-address">{link.text}</span>
                </>
              ) : (
                link.text
              )}
            </TextLink>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  )
}
