import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EventMedia } from '../api/eventsApi'
import {
  getMediaExtension,
  getMediaName,
  isImageMedia,
  isPdfMedia,
  resolveEventMediaUrl,
} from '../lib/eventMedia'
import styles from './EventMediaViewer.module.css'

type EventMediaViewerProps = {
  items: EventMedia[]
}

const minZoom = 1
const maxZoom = 2.5
const zoomStep = 0.25

export function EventMediaViewer({ items }: EventMediaViewerProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoom, setZoom] = useState(1)

  if (!items.length) {
    return null
  }

  const safeActiveIndex = Math.min(activeIndex, items.length - 1)
  const activeItem = items[safeActiveIndex]
  const mediaUrl = resolveEventMediaUrl(activeItem)
  const imageMedia = isImageMedia(activeItem)
  const pdfMedia = isPdfMedia(activeItem)

  function goToItem(index: number) {
    setActiveIndex(index)
    setZoom(1)
  }

  function move(direction: -1 | 1) {
    setActiveIndex((current) => Math.min(Math.max(current + direction, 0), items.length - 1))
    setZoom(1)
  }

  function updateZoom(direction: -1 | 1) {
    setZoom((current) =>
      Math.min(maxZoom, Math.max(minZoom, Number((current + direction * zoomStep).toFixed(2)))),
    )
  }

  return (
    <div className={styles.viewer}>
      <div className={styles.viewerHeader}>
        <div>
          <p className={styles.viewerEyebrow}>{t('eventDetail.mediaLabel')}</p>
          <h3 className={styles.viewerTitle}>{getMediaName(activeItem)}</h3>
        </div>

        <div className={styles.viewerActions}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => move(-1)}
            disabled={safeActiveIndex === 0}
          >
            {t('common.previous')}
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => move(1)}
            disabled={safeActiveIndex === items.length - 1}
          >
            {t('common.next')}
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => updateZoom(-1)}
            disabled={!imageMedia && !pdfMedia}
          >
            {t('common.zoomOut')}
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => setZoom(1)}
            disabled={!imageMedia && !pdfMedia}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => updateZoom(1)}
            disabled={!imageMedia && !pdfMedia}
          >
            {t('common.zoomIn')}
          </button>
          <a
            className={styles.linkButton}
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('common.openFile')}
          </a>
        </div>
      </div>

      <div className={styles.canvas}>
        {imageMedia ? (
          <div className={styles.imageStage}>
            <img
              src={mediaUrl}
              alt={getMediaName(activeItem)}
              className={styles.image}
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        ) : pdfMedia ? (
          <iframe
            key={`${activeItem.id}-${zoom}`}
            title={getMediaName(activeItem)}
            className={styles.documentFrame}
            src={`${mediaUrl}#toolbar=0&navpanes=0&zoom=${Math.round(zoom * 100)}`}
          />
        ) : (
          <div className={styles.filePreview}>
            <span className={styles.fileBadge}>{getMediaExtension(activeItem)}</span>
            <h4>{getMediaName(activeItem)}</h4>
            <p>{t('eventDetail.nonPreviewableMedia')}</p>
            <a href={mediaUrl} target="_blank" rel="noreferrer" className={styles.primaryLink}>
              {t('common.openFile')}
            </a>
          </div>
        )}
      </div>

      <div className={styles.thumbnailGrid}>
        {items.map((item, index) => {
          const selected = safeActiveIndex === index
          const thumbnailUrl = resolveEventMediaUrl(item)

          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.thumbnailButton} ${selected ? styles.thumbnailSelected : ''}`}
              onClick={() => goToItem(index)}
            >
              {isImageMedia(item) ? (
                <img
                  src={thumbnailUrl}
                  alt={getMediaName(item)}
                  className={styles.thumbnailImage}
                />
              ) : (
                <span className={styles.thumbnailFileType}>{getMediaExtension(item)}</span>
              )}
              <span className={styles.thumbnailLabel}>{getMediaName(item)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
