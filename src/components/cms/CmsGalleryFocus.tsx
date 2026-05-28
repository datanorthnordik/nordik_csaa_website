import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import styles from './CmsGallerySection.module.css'

type CmsGalleryFocusProps = {
  items: CmsGalleryAsset[]
  showTitleDescription: boolean
  onOpen: (index: number) => void
}

export function CmsGalleryFocus({
  items,
  showTitleDescription,
  onOpen,
}: CmsGalleryFocusProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(items.length - 1, 0)))
  }, [items.length])

  if (!items.length) {
    return null
  }

  const safeIndex = Math.min(activeIndex, items.length - 1)
  const activeItem = items[safeIndex]
  const activeLabel = activeItem.title || activeItem.altText

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + items.length) % items.length)
  }

  return (
    <div className={styles.focusLayout}>
      <div className={styles.focusStage}>
        <button
          type="button"
          className={styles.stageAction}
          onClick={() => onOpen(safeIndex)}
          aria-label={activeLabel}
        >
          <img
            src={activeItem.imageUrl}
            alt={activeItem.altText}
            className={styles.focusImage}
          />
          {showTitleDescription ? (
            <>
              <span className={styles.focusShade} aria-hidden="true" />
              <div className={styles.focusBody}>
                <h3 className={styles.focusTitle}>{activeLabel}</h3>
                {activeItem.details && activeItem.details !== activeLabel ? (
                  <p className={styles.focusDetails}>{activeItem.details}</p>
                ) : null}
              </div>
            </>
          ) : null}
        </button>

        {items.length > 1 ? (
          <div className={styles.focusControls}>
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

      {items.length > 1 ? (
        <div className={styles.focusRail}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.focusThumb} ${
                safeIndex === index ? styles.focusThumbSelected : ''
              }`}
              onClick={() => setActiveIndex(index)}
              aria-pressed={safeIndex === index}
            >
              <img
                src={item.imageUrl}
                alt={item.altText}
                className={styles.focusThumbImage}
              />
              {showTitleDescription ? (
                <>
                  <span className={styles.focusThumbShade} aria-hidden="true" />
                  <span className={styles.focusThumbLabel}>{item.title || item.altText}</span>
                </>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
