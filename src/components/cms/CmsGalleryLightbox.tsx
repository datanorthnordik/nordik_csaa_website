import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import styles from './CmsGallerySection.module.css'

type CmsGalleryLightboxProps = {
  items: CmsGalleryAsset[]
  showTitleDescription: boolean
  activeIndex: number | null
  onClose: () => void
  onSelect: (index: number) => void
}

const slideshowIntervalMs = 4200
const minZoom = 1
const maxZoom = 3
const zoomStep = 0.25

export function CmsGalleryLightbox({
  items,
  showTitleDescription,
  activeIndex,
  onClose,
  onSelect,
}: CmsGalleryLightboxProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slideshowProgress, setSlideshowProgress] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [imageNaturalSizes, setImageNaturalSizes] = useState<
    Record<number, {
      width: number
      height: number
    }>
  >({})

  const safeIndex =
    activeIndex === null || !items.length
      ? 0
      : Math.min(Math.max(activeIndex, 0), items.length - 1)
  const activeItem = items[safeIndex]
  const activeImageNaturalSize = imageNaturalSizes[activeItem?.id ?? -1] ?? null
  const activeLabel = activeItem ? activeItem.title || activeItem.altText : ''
  const showCaption = showTitleDescription && Boolean(activeItem?.title || activeItem?.details)
  const captionTooltip = [activeItem?.title, activeItem?.details]
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)
    .join('\n')

  function cacheImageNaturalSize(
    imageId: number,
    naturalSize: {
      width: number
      height: number
    },
  ) {
    if (naturalSize.width <= 0 || naturalSize.height <= 0) {
      return
    }

    setImageNaturalSizes((current) => {
      const existing = current[imageId]
      if (
        existing &&
        existing.width === naturalSize.width &&
        existing.height === naturalSize.height
      ) {
        return current
      }

      return {
        ...current,
        [imageId]: naturalSize,
      }
    })
  }

  useLayoutEffect(() => {
    if (activeIndex === null || !activeItem) {
      return
    }

    const currentImage = imageRef.current
    if (!currentImage || !currentImage.complete) {
      return
    }

    cacheImageNaturalSize(activeItem.id, {
      width: currentImage.naturalWidth,
      height: currentImage.naturalHeight,
    })
  }, [activeIndex, activeItem?.id])

  useEffect(() => {
    if (activeIndex !== null) {
      return
    }

    setIsSlideshowPlaying(false)
    setShowThumbnails(false)
    setSlideshowProgress(0)
    setZoom(1)
    setCanvasSize({ width: 0, height: 0 })
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    setZoom(1)
  }, [activeIndex, activeItem?.id])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const rootElement = document.documentElement
    const previousOverflow = document.body.style.overflow
    const previousBodyOverscrollBehavior = document.body.style.overscrollBehavior
    const previousRootOverflow = rootElement.style.overflow
    const previousRootOverscrollBehavior = rootElement.style.overscrollBehavior

    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    rootElement.style.overflow = 'hidden'
    rootElement.style.overscrollBehavior = 'none'

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
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        updateZoom(1)
      }
      if (event.key === '-') {
        event.preventDefault()
        updateZoom(-1)
      }
      if (event.key === '0') {
        event.preventDefault()
        resetZoom()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousBodyOverscrollBehavior
      rootElement.style.overflow = previousRootOverflow
      rootElement.style.overscrollBehavior = previousRootOverscrollBehavior
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

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    function measureCanvas() {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) {
        return
      }

      const nextWidth = Math.round(rect.width)
      const nextHeight = Math.round(rect.height)

      setCanvasSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : {
              width: nextWidth,
              height: nextHeight,
            },
      )
    }

    const frameId = window.requestAnimationFrame(measureCanvas)

    window.addEventListener('resize', measureCanvas)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', measureCanvas)
    }
  }, [activeIndex, showThumbnails, isFullscreen, safeIndex])

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
    setZoom(1)
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

  function updateZoom(direction: -1 | 1) {
    setIsSlideshowPlaying(false)
    setZoom((current) =>
      Math.min(maxZoom, Math.max(minZoom, Number((current + direction * zoomStep).toFixed(2)))),
    )
  }

  function resetZoom() {
    setZoom(1)
  }

  const fittedImageStyle = getFittedImageStyle(canvasSize, activeImageNaturalSize, zoom)

  return (
    <div
      className={styles.viewerOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={activeLabel}
    >
      <div ref={panelRef} className={styles.viewerPanel}>
        <div className={styles.viewerTopBar}>
          <span className={styles.viewerCounter}>
            {safeIndex + 1} / {items.length}
          </span>

          {showCaption ? (
            <div className={styles.viewerCaption} title={captionTooltip || undefined}>
              {activeItem.title ? (
                <p className={styles.viewerCaptionTitle}>{activeItem.title}</p>
              ) : null}
              {activeItem.details && activeItem.details !== activeItem.title ? (
                <p className={styles.viewerCaptionText}>{activeItem.details}</p>
              ) : null}
            </div>
          ) : null}

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

            <div className={styles.viewerZoomGroup}>
              <button
                type="button"
                className={styles.viewerIconButton}
                onClick={() => updateZoom(-1)}
                disabled={zoom <= minZoom}
                aria-label={t('common.zoomOut')}
                title={t('common.zoomOut')}
              >
                <ViewerIcon name="minus" />
              </button>

              <button
                type="button"
                className={styles.viewerZoomReadout}
                onClick={resetZoom}
                disabled={zoom === 1}
                aria-label={t('common.resetZoom')}
                title={t('common.resetZoom')}
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                type="button"
                className={styles.viewerIconButton}
                onClick={() => updateZoom(1)}
                disabled={zoom >= maxZoom}
                aria-label={t('common.zoomIn')}
                title={t('common.zoomIn')}
              >
                <ViewerIcon name="plus" />
              </button>
            </div>

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

        <div
          className={`${styles.viewerWorkspace} ${
            showThumbnails && items.length > 1
              ? styles.viewerWorkspaceWithRail
              : styles.viewerWorkspaceSolo
          }`}
        >
          <div className={styles.viewerStage}>
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

            <div ref={canvasRef} className={styles.viewerCanvas}>
              <div className={styles.viewerCanvasFrame}>
                <img
                  key={activeItem.id}
                  ref={imageRef}
                  src={activeItem.imageUrl}
                  alt={activeItem.altText}
                  className={styles.viewerImage}
                  style={fittedImageStyle}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={(event) => {
                    cacheImageNaturalSize(activeItem.id, {
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })
                  }}
                />
              </div>
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
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
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
    | 'plus'
    | 'minus'
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
      {name === 'plus' ? (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      ) : null}
      {name === 'minus' ? <path d="M5 12h14" /> : null}
    </svg>
  )
}

function getFittedImageStyle(
  canvasSize: { width: number; height: number },
  imageNaturalSize: { width: number; height: number } | null,
  zoom: number,
) {
  if (
    canvasSize.width <= 0 ||
    canvasSize.height <= 0 ||
    !imageNaturalSize ||
    imageNaturalSize.width <= 0 ||
    imageNaturalSize.height <= 0
  ) {
    return undefined
  }

  const fitScale = Math.min(
    canvasSize.width / imageNaturalSize.width,
    canvasSize.height / imageNaturalSize.height,
  )

  if (!Number.isFinite(fitScale) || fitScale <= 0) {
    return undefined
  }

  const fittedWidth = Math.max(1, Math.floor(imageNaturalSize.width * fitScale * zoom))
  const fittedHeight = Math.max(1, Math.floor(imageNaturalSize.height * fitScale * zoom))

  return {
    width: `${fittedWidth}px`,
    height: `${fittedHeight}px`,
  }
}
