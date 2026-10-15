import { Volume2, VolumeX, X } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useCallback, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/i18n'

interface ProjectVideoPreviewProps {
  source: HTMLVideoElement
  name: string
  muted: boolean
  hasAudio: boolean
  onToggleMuted: () => void
  onClose: () => void
}

/** A native modal keeps focus inside the player and restores it to the opener. */
export function ProjectVideoPreview({
  source,
  name,
  muted,
  hasAudio,
  onToggleMuted,
  onClose,
}: ProjectVideoPreviewProps) {
  const { t } = useI18n()
  const reducedMotion = useReducedMotion()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const closingRef = useRef(false)

  const animatePreview = useCallback((opening: boolean) => {
    const frame = frameRef.current!
    const overlay = overlayRef.current!
    const origin = source.getBoundingClientRect()
    const hasOrigin = origin.width > 0 && origin.height > 0
    const thumbnailTransform = hasOrigin
      ? `translate(${origin.left - frame.offsetLeft}px, ${origin.top - frame.offsetTop}px) scale(${origin.width / frame.offsetWidth}, ${origin.height / frame.offsetHeight})`
      : 'none'
    // Read the current transform before cancelling so a quick dismissal can reverse mid-flight.
    const currentTransform = getComputedStyle(frame).transform
    const currentOpacity = Number(getComputedStyle(overlay).opacity)
    for (const element of [frame, overlay]) {
      element.getAnimations().forEach((animation) => animation.cancel())
    }
    const timing: KeyframeAnimationOptions = {
      duration: reducedMotion ? 0 : opening ? 280 : 200,
      easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      fill: 'forwards',
    }
    overlay.animate({ opacity: opening ? [0, 1] : [currentOpacity, 0] }, timing)
    return frame.animate(
      {
        transform: opening ? [thumbnailTransform, 'none'] : [currentTransform, thumbnailTransform],
        opacity: opening || hasOrigin ? [1, 1] : [1, 0],
      },
      timing,
    )
  }, [source, reducedMotion])

  useLayoutEffect(() => {
    const dialog = dialogRef.current!
    const video = videoRef.current!
    const frame = frameRef.current!
    const overlay = overlayRef.current!
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const startTime = source.currentTime

    closingRef.current = false
    source.pause()
    root.style.overflow = 'hidden'
    dialog.showModal()
    closeButtonRef.current?.focus({ preventScroll: true })
    animatePreview(true)

    const updatePlayback = () => {
      if (document.hidden) video.pause()
      else void video.play().catch(() => {
        // A browser can defer playback until a user gesture permits it.
      })
    }
    const startPlayback = () => {
      video.currentTime = startTime
      updatePlayback()
    }
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) startPlayback()
    else video.addEventListener('loadedmetadata', startPlayback, { once: true })
    document.addEventListener('visibilitychange', updatePlayback)

    return () => {
      video.pause()
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) source.currentTime = video.currentTime
      video.removeEventListener('loadedmetadata', startPlayback)
      document.removeEventListener('visibilitychange', updatePlayback)
      for (const element of [frame, overlay]) {
        element.getAnimations().forEach((animation) => animation.cancel())
      }
      root.style.overflow = previousOverflow
      dialog.close()
    }
  }, [source, animatePreview])

  const closePreview = () => {
    if (closingRef.current) return
    closingRef.current = true
    void animatePreview(false).finished
      .then(() => dialogRef.current?.close())
      .catch(() => {
        // Unmounting cancels an in-progress transition.
      })
  }
  const soundLabel = muted ? t.projects.unmute : t.projects.mute
  const SoundIcon = muted ? VolumeX : Volume2

  return createPortal(
    <dialog
      ref={dialogRef}
      className="project-video-dialog"
      aria-label={`${name} — ${t.projects.preview}`}
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault()
        closePreview()
      }}
      onClose={(event) => {
        // Strict Mode can close and reopen the dialog before the close event is delivered.
        if (!event.currentTarget.open) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closePreview()
      }}
    >
      <div ref={overlayRef} className="project-video-overlay" aria-hidden="true" />
      <div ref={frameRef} className="project-video-preview-frame">
        <div className="project-video-preview-controls">
          {hasAudio && (
            <button
              type="button"
              className="project-video-toggle"
              aria-label={soundLabel}
              title={soundLabel}
              onClick={onToggleMuted}
            >
              <SoundIcon size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            className="project-video-toggle"
            aria-label={t.projects.closePreview}
            title={t.projects.closePreview}
            onClick={closePreview}
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <video
          ref={videoRef}
          className="project-video"
          src={source.currentSrc || source.src}
          loop
          muted={muted}
          playsInline
          preload="auto"
          aria-label={name}
        />
      </div>
    </dialog>,
    document.body,
  )
}
