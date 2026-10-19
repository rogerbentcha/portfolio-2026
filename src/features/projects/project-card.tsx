import { Maximize2, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type Ref } from 'react'
import type { Project } from '@/content/types'
import { useI18n } from '@/i18n'
import { ProjectVideoPreview } from './project-video-preview'

interface ProjectCardProps {
  project: Project
  className: string
  active?: boolean
  anchorRef?: Ref<HTMLSpanElement>
  onFocus: () => void
}

export function ProjectCard({
  project,
  className,
  active = true,
  anchorRef,
  onFocus,
}: ProjectCardProps) {
  const { t } = useI18n()
  const [muted, setMuted] = useState(true)
  const [previewSource, setPreviewSource] = useState<HTMLVideoElement | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!active || previewSource) {
      video.pause()
      return
    }

    let visible = false
    const updatePlayback = () => {
      if (visible && !document.hidden) {
        void video.play().catch(() => {
          // Browsers may defer autoplay until the user interacts with the page.
        })
      } else {
        video.pause()
      }
    }
    // Both responsive layouts exist in the DOM; only the visible one should play.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      updatePlayback()
    })
    observer.observe(video)
    document.addEventListener('visibilitychange', updatePlayback)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updatePlayback)
      video.pause()
    }
  }, [active, project.video, previewSource])

  const openPreview = (event: MouseEvent<HTMLButtonElement>) => {
    if (!videoRef.current) return
    event.currentTarget.focus({ preventScroll: true })
    setPreviewSource(videoRef.current)
  }
  const moveTooltip = (event: PointerEvent<HTMLButtonElement>) => {
    const tooltip = tooltipRef.current
    if (!tooltip || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(
      8,
      Math.min(event.clientX - bounds.left + 14, bounds.width - tooltip.offsetWidth - 8),
    )
    const y = Math.max(
      8,
      Math.min(event.clientY - bounds.top + 14, bounds.height - tooltip.offsetHeight - 8),
    )
    tooltip.style.transform = `translate(${x}px, ${y}px)`
  }

  const soundLabel = muted ? t.projects.unmute : t.projects.mute
  const SoundIcon = muted ? VolumeX : Volume2
  const hasSoundControl = Boolean(project.video) && project.videoHasAudio !== false
  const previewLabel = `${t.projects.openPreview}: ${project.name}`

  return (
    <div
      className={className}
      data-active={active ? 'true' : 'false'}
      aria-hidden={!active || undefined}
      inert={!active}
      onFocus={onFocus}
    >
      {anchorRef && <span ref={anchorRef} className="project-preview-anchor" aria-hidden="true" />}
      {(project.openSource || project.video) && (
        <div className="project-media-header">
          {project.openSource && (
            <span className="project-open-source">{t.projects.openSource}</span>
          )}
          {project.video && (
            <div className="project-video-controls">
              {hasSoundControl && (
                <button
                  type="button"
                  className="project-video-toggle"
                  aria-label={soundLabel}
                  title={soundLabel}
                  onClick={() => setMuted((current) => !current)}
                >
                  <SoundIcon size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="project-video-toggle"
                aria-label={previewLabel}
                aria-haspopup="dialog"
                title={t.projects.openPreview}
                onClick={openPreview}
              >
                <Maximize2 size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
      <div className="project-preview-content">
        {project.video ? (
          <button
            type="button"
            className="project-thumbnail project-video-trigger"
            aria-label={previewLabel}
            aria-haspopup="dialog"
            data-preview-open={Boolean(previewSource)}
            onClick={openPreview}
            onPointerEnter={moveTooltip}
            onPointerMove={moveTooltip}
          >
            <video
              ref={videoRef}
              className="project-video"
              src={project.video}
              autoPlay={active && !previewSource}
              loop
              muted={muted}
              playsInline
              preload={active ? 'metadata' : 'none'}
              aria-hidden="true"
            />
            <span ref={tooltipRef} className="project-video-tooltip" aria-hidden="true">
              {t.projects.openPreview}
            </span>
          </button>
        ) : (
          <a className="project-thumbnail" href={project.href} aria-label={project.name}>
            <span className="project-thumbnail-initials" aria-hidden="true">
              {project.name.slice(0, 2)}
            </span>
          </a>
        )}
        <a
          className="project-details"
          href={project.href}
          aria-label={project.name}
          aria-describedby={`project-${project.id}-description`}
        >
          <span className="project-description">{project.description}</span>
          <span className="project-stack">
            {project.stack.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </span>
        </a>
      </div>
      {previewSource && (
        <ProjectVideoPreview
          source={previewSource}
          name={project.name}
          muted={muted}
          hasAudio={hasSoundControl}
          onToggleMuted={() => setMuted((current) => !current)}
          onClose={() => setPreviewSource(null)}
        />
      )}
    </div>
  )
}
