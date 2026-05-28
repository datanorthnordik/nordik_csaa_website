import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import styles from './CmsGallerySection.module.css'

type CmsGalleryLightboxProps = {
  items: CmsGalleryAsset[]
  activeIndex: number | null
  onClose: () => void
  onSelect: (index: number) => void
}

const slideshowIntervalMs = 4200

export function CmsGalleryLightbox({
  items,
  activeIndex,
  onClose,
  onSelect,
}: CmsGalleryLightboxProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slideshowProgress, setSlideshowProgress] = useState(0)

  const safeIndex =
    activeIndex === null || !items.length
      ? 0
      : Math.min(Math.max(activeIndex, 0), items.length - 1)
  const activeItem = items[safeIndex]
  const activeLabel = activeItem ? activeItem.title || activeItem.altText : ''

  useEffect(() => {
    if (activeIndex !== null) {
      return
    }

    setIsSlideshowPlaying(false)
    setShowThumbnails(false)
    setSlideshowProgress(0)
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        move(-1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        move(1)
      }
      if (event.key === ' ') {
        event.preventDefault()
        if (items.length > 1) {
          setIsSlideshowPlaying((current) => !current)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, items.length, safeIndex])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === panelRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    if (!isSlideshowPlaying || activeIndex === null || items.length <= 1) {
      setSlideshowProgress(0)
      return
    }

    let frameId = 0
    let startedAt: number | null = null

    setSlideshowProgress(0)

    function step(timestamp: number) {
      if (startedAt === null) {
        startedAt = timestamp
      }

      const nextProgress = Math.min((timestamp - startedAt) / slideshowIntervalMs, 1)
      setSlideshowProgress(nextProgress)

      if (nextProgress >= 1) {
        onSelect((safeIndex + 1) % items.length)
        return
      }

      frameId = window.requestAnimationFrame(step)
    }

    frameId = window.requestAnimationFrame(step)
    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isSlideshowPlaying, activeIndex, items.length, onSelect, safeIndex])

  useEffect(() => {
    if (!showThumbnails || activeIndex === null || items.length <= 1) {
      return
    }

    thumbRefs.current[safeIndex]?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
    })
  }, [showThumbnails, activeIndex, items.length, safeIndex])

  if (activeIndex === null || !items.length || !activeItem) {
    return null
  }

  function move(direction: -1 | 1) {
    if (items.length <= 1) {
      return
    }

    onSelect((safeIndex + direction + items.length) % items.length)
  }

  function handleClose() {
    setIsSlideshowPlaying(false)
    if (document.fullscreenElement === panelRef.current) {
      void document.exitFullscreen?.()
    }
    onClose()
  }

  function toggleFullscreen() {
    if (document.fullscreenElement === panelRef.current) {
      void document.exitFullscreen?.()
      return
    }

    void panelRef.current?.requestFullscreen?.()
  }

  return (
    <div
      className={styles.viewerOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={activeLabel}
    >
      <div ref={panelRef} className={styles.viewerPanel}>
        <div className={styles.viewerTopBar}>
          <div className={styles.viewerMeta}>
            <span className={styles.viewerCounter}>
              {safeIndex + 1} / {items.length}
            </span>
            {activeItem.title || activeItem.details ? (
              <div className={styles.viewerCaption}>
                {activeItem.title ? (
                  <p className={styles.viewerCaptionTitle}>{activeItem.title}</p>
                ) : null}
                {activeItem.details && activeItem.details !== activeItem.title ? (
                  <p className={styles.viewerCaptionText}>{activeItem.details}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={styles.viewerToolbar}>
            {items.length > 1 ? (
              <button
                type="button"
                className={`${styles.viewerIconButton} ${
                  isSlideshowPlaying ? styles.viewerIconButtonActive : ''
                }`}
                onClick={() => setIsSlideshowPlaying((current) => !current)}
                aria-label={
                  isSlideshowPlaying
                    ? t('common.pauseSlideshow')
                    : t('common.playSlideshow')
                }
                title={
                  isSlideshowPlaying
                    ? t('common.pauseSlideshow')
                    : t('common.playSlideshow')
                }
              >
                <ViewerIcon name={isSlideshowPlaying ? 'pause' : 'play'} />
              </button>
            ) : null}

            <button
              type="button"
              className={styles.viewerIconButton}
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')
              }
              title={
                isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')
              }
            >
              <ViewerIcon name={isFullscreen ? 'collapse' : 'expand'} />
            </button>

            {items.length > 1 ? (
              <button
                type="button"
                className={`${styles.viewerIconButton} ${
                  showThumbnails ? styles.viewerIconButtonActive : ''
                }`}
                onClick={() => setShowThumbnails((current) => !current)}
                aria-label={
                  showThumbnails ? t('common.hideThumbnails') : t('common.showThumbnails')
                }
                title={
                  showThumbnails ? t('common.hideThumbnails') : t('common.showThumbnails')
                }
              >
                <ViewerIcon name="grid" />
              </button>
            ) : null}

            <button
              type="button"
              className={styles.viewerIconButton}
              onClick={handleClose}
              aria-label={t('common.close')}
              title={t('common.close')}
            >
              <ViewerIcon name="close" />
            </button>
          </div>
        </div>

        {items.length > 1 ? (
          <div className={styles.viewerProgressTrack} aria-hidden="true">
            <span
              className={styles.viewerProgressFill}
              style={{
                transform: `scaleX(${isSlideshowPlaying ? slideshowProgress : 0})`,
              }}
            />
          </div>
        ) : null}

        {items.length > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.viewerNavButton} ${styles.viewerNavButtonLeft}`}
              onClick={() => move(-1)}
              aria-label={t('common.previous')}
              title={t('common.previous')}
            >
              <ViewerIcon name="arrowLeft" />
            </button>
            <button
              type="button"
              className={`${styles.viewerNavButton} ${styles.viewerNavButtonRight}`}
              onClick={() => move(1)}
              aria-label={t('common.next')}
              title={t('common.next')}
            >
              <ViewerIcon name="arrowRight" />
            </button>
          </>
        ) : null}

        <div
          className={`${styles.viewerWorkspace} ${
            showThumbnails && items.length > 1
              ? styles.viewerWorkspaceWithRail
              : styles.viewerWorkspaceSolo
          }`}
        >
          <div className={styles.viewerStage}>
            <div className={styles.viewerCanvas}>
              <img
                src={activeItem.imageUrl}
                alt={activeItem.altText}
                className={styles.viewerImage}
              />
            </div>
          </div>

          {showThumbnails && items.length > 1 ? (
            <aside className={styles.viewerRail} aria-label={t('common.showThumbnails')}>
              <div className={styles.viewerThumbGrid}>
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    ref={(element) => {
                      thumbRefs.current[index] = element
                    }}
                    type="button"
                    className={`${styles.viewerThumb} ${
                      safeIndex === index ? styles.viewerThumbActive : ''
                    }`}
                    onClick={() => onSelect(index)}
                    aria-pressed={safeIndex === index}
                    aria-current={safeIndex === index ? 'true' : undefined}
                    aria-label={item.title || item.altText}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.altText}
                      className={styles.viewerThumbImage}
                    />
                    <span className={styles.viewerThumbOverlay} aria-hidden="true" />
                    <span className={styles.viewerThumbIndex} aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {safeIndex === index ? (
                      <>
                        <span className={styles.viewerThumbCurrentBadge} aria-hidden="true">
                          <span className={styles.viewerThumbCurrentPulse} />
                          {t('common.current')}
                        </span>
                        <span className={styles.viewerThumbCurrentMark} aria-hidden="true" />
                      </>
                    ) : null}
                  </button>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ViewerIcon({
  name,
}: {
  name:
    | 'play'
    | 'pause'
    | 'expand'
    | 'collapse'
    | 'grid'
    | 'close'
    | 'arrowLeft'
    | 'arrowRight'
}) {
  return (
    <svg
      className={styles.viewerIcon}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'play' ? <path d="m8 6 10 6-10 6V6Z" fill="currentColor" stroke="none" /> : null}
      {name === 'pause' ? (
        <>
          <path d="M8 6h3v12H8z" fill="currentColor" stroke="none" />
          <path d="M13 6h3v12h-3z" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === 'expand' ? (
        <>
          <path d="M8 3H3v5" />
          <path d="M16 3h5v5" />
          <path d="M3 16v5h5" />
          <path d="M21 16v5h-5" />
          <path d="M8 8 3 3" />
          <path d="m16 8 5-5" />
          <path d="m8 16-5 5" />
          <path d="m16 16 5 5" />
        </>
      ) : null}
      {name === 'collapse' ? (
        <>
          <path d="M9 3H3v6" />
          <path d="M15 3h6v6" />
          <path d="M3 15v6h6" />
          <path d="M21 15v6h-6" />
          <path d="m9 9-6-6" />
          <path d="m15 9 6-6" />
          <path d="m9 15-6 6" />
          <path d="m15 15 6 6" />
        </>
      ) : null}
      {name === 'grid' ? (
        <>
          <rect x="4" y="4" width="6" height="6" fill="currentColor" stroke="none" />
          <rect x="14" y="4" width="6" height="6" fill="currentColor" stroke="none" />
          <rect x="4" y="14" width="6" height="6" fill="currentColor" stroke="none" />
          <rect x="14" y="14" width="6" height="6" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === 'close' ? (
        <>
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </>
      ) : null}
      {name === 'arrowLeft' ? (
        <>
          <path d="m15 18-6-6 6-6" />
          <path d="M9 12h9" />
        </>
      ) : null}
      {name === 'arrowRight' ? (
        <>
          <path d="m9 6 6 6-6 6" />
          <path d="M15 12H6" />
        </>
      ) : null}
    </svg>
  )
}
