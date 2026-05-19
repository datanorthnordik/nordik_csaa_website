import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import styles from './CmsGallerySection.module.css'

type CmsGalleryLightboxProps = {
  items: CmsGalleryAsset[]
  activeIndex: number | null
  onClose: () => void
  onSelect: (index: number) => void
}

const minZoom = 1
const maxZoom = 3
const zoomStep = 0.25

export function CmsGalleryLightbox({
  items,
  activeIndex,
  onClose,
  onSelect,
}: CmsGalleryLightboxProps) {
  const { t } = useTranslation()
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    setZoom(1)
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        move(-1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        move(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, onClose, onSelect, items.length])

  if (activeIndex === null || !items.length) {
    return null
  }

  const safeIndex = Math.min(Math.max(activeIndex, 0), items.length - 1)
  const activeItem = items[safeIndex]
  const activeLabel = activeItem.title || activeItem.altText

  function move(direction: -1 | 1) {
    if (items.length <= 1) {
      return
    }

    onSelect((safeIndex + direction + items.length) % items.length)
  }

  function updateZoom(direction: -1 | 1) {
    setZoom((current) =>
      Math.min(maxZoom, Math.max(minZoom, Number((current + direction * zoomStep).toFixed(2)))),
    )
  }

  return (
    <div
      className={styles.viewerOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={activeLabel}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={styles.viewerPanel}>
        <div className={styles.viewerHeader}>
          <div>
            <p className={styles.viewerEyebrow}>
              {t('cmsGallery.imageCount', { current: safeIndex + 1, total: items.length })}
            </p>
            <h3 className={styles.viewerTitle}>{activeLabel}</h3>
            {activeItem.details && activeItem.details !== activeLabel ? (
              <p className={styles.viewerDetails}>{activeItem.details}</p>
            ) : null}
          </div>

          <div className={styles.viewerActions}>
            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  className={styles.viewerButton}
                  onClick={() => move(-1)}
                >
                  {t('common.previous')}
                </button>
                <button
                  type="button"
                  className={styles.viewerButton}
                  onClick={() => move(1)}
                >
                  {t('common.next')}
                </button>
              </>
            ) : null}
            <button
              type="button"
              className={styles.viewerButton}
              onClick={() => updateZoom(-1)}
              disabled={zoom <= minZoom}
            >
              {t('common.zoomOut')}
            </button>
            <button
              type="button"
              className={styles.viewerButton}
              onClick={() => setZoom(1)}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className={styles.viewerButton}
              onClick={() => updateZoom(1)}
              disabled={zoom >= maxZoom}
            >
              {t('common.zoomIn')}
            </button>
            <a
              href={activeItem.fileUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.viewerLink}
            >
              {t('common.openFile')}
            </a>
            <button type="button" className={styles.viewerButton} onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>

        <div className={styles.viewerStage}>
          <img
            src={activeItem.imageUrl}
            alt={activeItem.altText}
            className={styles.viewerImage}
            style={{ transform: `scale(${zoom})` }}
          />
        </div>

        {items.length > 1 ? (
          <div className={styles.viewerThumbStrip}>
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.viewerThumb} ${
                  safeIndex === index ? styles.viewerThumbActive : ''
                }`}
                onClick={() => onSelect(index)}
                aria-pressed={safeIndex === index}
              >
                <img
                  src={item.imageUrl}
                  alt={item.altText}
                  className={styles.viewerThumbImage}
                />
                <span className={styles.viewerThumbLabel}>{item.title || item.altText}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
