import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import styles from './CmsGallerySection.module.css'

const carouselAutoScrollIntervalMs = 5000

type CmsGalleryCarouselProps = {
  items: CmsGalleryAsset[]
  showTitleDescription: boolean
  autoScrollEnabled: boolean
  onOpen: (index: number) => void
}

export function CmsGalleryCarousel({
  items,
  showTitleDescription,
  autoScrollEnabled,
  onOpen,
}: CmsGalleryCarouselProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(items.length - 1, 0)))
  }, [items.length])

  useEffect(() => {
    if (!autoScrollEnabled || items.length <= 1) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, carouselAutoScrollIntervalMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeIndex, autoScrollEnabled, items.length])

  if (!items.length) {
    return null
  }

  const safeIndex = Math.min(activeIndex, items.length - 1)
  const activeItem = items[safeIndex]
  const activeLabel = activeItem.title || activeItem.altText
  const previewIndexes = buildPreviewIndexes(items.length, safeIndex)

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + items.length) % items.length)
  }

  return (
    <div className={styles.carouselLayout}>
      <div className={styles.carouselStage}>
        <button
          type="button"
          className={styles.stageAction}
          onClick={() => onOpen(safeIndex)}
          aria-label={activeLabel}
        >
          <div className={styles.carouselImageWrap}>
            <img
              src={activeItem.imageUrl}
              alt={activeItem.altText}
              className={styles.carouselImage}
            />
          </div>
          {showTitleDescription ? (
            <>
              <span className={styles.carouselShade} aria-hidden="true" />
              <div className={styles.carouselBody}>
                <h3 className={styles.carouselTitle}>{activeLabel}</h3>
                {activeItem.details && activeItem.details !== activeLabel ? (
                  <p className={styles.carouselDetails}>{activeItem.details}</p>
                ) : null}
              </div>
            </>
          ) : null}
        </button>

        {items.length > 1 ? (
          <div className={styles.carouselNav}>
            <button
              type="button"
              className={styles.roundButton}
              onClick={(event) => {
                event.stopPropagation()
                move(-1)
              }}
              aria-label={t('common.previous')}
            >
              &larr;
            </button>
            <button
              type="button"
              className={styles.roundButton}
              onClick={(event) => {
                event.stopPropagation()
                move(1)
              }}
              aria-label={t('common.next')}
            >
              &rarr;
            </button>
          </div>
        ) : null}
      </div>

      {previewIndexes.length > 1 ? (
        <div className={styles.carouselRail}>
          {previewIndexes.map((index) => {
            const item = items[index]

            return (
              <button
                key={`${item.id}-${index}`}
                type="button"
                className={`${styles.carouselThumb} ${
                  safeIndex === index ? styles.carouselThumbActive : ''
                }`}
                onClick={() => setActiveIndex(index)}
                aria-pressed={safeIndex === index}
              >
                <img
                  src={item.imageUrl}
                  alt={item.altText}
                  className={styles.carouselThumbImage}
                />
                {showTitleDescription ? (
                  <>
                    <span className={styles.carouselThumbShade} aria-hidden="true" />
                    <span className={styles.carouselThumbLabel}>{item.title || item.altText}</span>
                  </>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {items.length > 1 ? (
        <div className={styles.carouselFooter} aria-hidden="true">
          {items.map((item, index) => (
            <span
              key={item.id}
              className={safeIndex === index ? styles.carouselDotActive : styles.carouselDot}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function buildPreviewIndexes(total: number, activeIndex: number) {
  if (total <= 3) {
    return Array.from({ length: total }, (_, index) => index)
  }

  return [activeIndex - 1, activeIndex, activeIndex + 1].map(
    (index) => (index + total) % total,
  )
}
