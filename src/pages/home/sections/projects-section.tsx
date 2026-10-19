import { useRef, useState, type CSSProperties } from 'react'
import * as motion from 'motion/react-m'
import { Section } from '@/components/ui/section'
import { ProjectCard } from '@/features/projects/project-card'
import { RubberBand } from '@/features/projects/rubber-band'
import { useI18n } from '@/i18n'
import { useTextEntrance } from '@/lib/motion'

export function ProjectsSection() {
  const { t, content } = useI18n()
  const entrance = useTextEntrance()
  const [selectedId, setSelectedId] = useState<string | null>(content.projects[0]?.id ?? null)
  const project = content.projects.find((item) => item.id === selectedId) ?? content.projects[0]
  const activeId = project?.id ?? null
  const hostRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLSpanElement>(null)
  const endRef = useRef<HTMLSpanElement>(null)

  return (
    <Section id="projects" title={t.sections.projects}>
      <motion.div
        {...entrance.group}
        ref={hostRef}
        className="projects-stage"
        data-active={project ? 'true' : 'false'}
        style={{ '--project-color': project?.color ?? 'transparent' } as CSSProperties}
      >
        <ul className="project-list">
          {content.projects.map((item) => (
            <motion.li
              {...entrance.item}
              key={item.id}
              style={{ '--project-color': item.color } as CSSProperties}
            >
              <a
                className="project-name-link"
                href={item.href}
                data-selected={activeId === item.id ? 'true' : 'false'}
                onPointerEnter={(event) => {
                  if (event.pointerType !== 'touch') setSelectedId(item.id)
                }}
                onFocus={() => setSelectedId(item.id)}
                aria-label={item.name}
                aria-describedby={`project-${item.id}-description`}
              >
                <span className="project-name">{item.name}</span>
                <span
                  className="project-name-anchor"
                  ref={activeId === item.id ? startRef : undefined}
                  aria-hidden="true"
                />
              </a>
              <ProjectCard
                project={item}
                className="project-mobile-details"
                onFocus={() => setSelectedId(item.id)}
              />
              <span id={`project-${item.id}-description`} className="sr-only">
                {item.openSource && `${t.projects.openSource}. `}
                {item.description} {item.stack.join(', ')}
              </span>
            </motion.li>
          ))}
        </ul>

        <motion.div {...entrance.item} className="project-preview-slot">
          {content.projects.map((item) => (
            <ProjectCard
              key={item.id}
              project={item}
              className="project-preview"
              active={item.id === activeId}
              anchorRef={item.id === activeId ? endRef : undefined}
              onFocus={() => setSelectedId(item.id)}
            />
          ))}
        </motion.div>
        <RubberBand
          hostRef={hostRef}
          startRef={startRef}
          endRef={endRef}
          activeKey={project?.id ?? null}
          color={project?.color ?? '#4564e8'}
          entrance={entrance.fadeItem}
        />
      </motion.div>
    </Section>
  )
}
