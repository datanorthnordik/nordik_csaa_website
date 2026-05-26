import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DocumentViewerModal } from './DocumentViewerModal'
import styles from './DocumentShowcase.module.css'

export type DocumentShowcaseItem = {
  id: number | string
  title: string
  description?: string
  previewUrl: string
  downloadUrl: string
  downloadFileName: string
  badgeLabel: string
  mimeType: string
}

type DocumentShowcaseProps = {
  heading: string
  items: DocumentShowcaseItem[]
  getSummary: (item: DocumentShowcaseItem) => {
    title: string
    description?: string
  }
  getDownloadLabel: (item: DocumentShowcaseItem) => string
  onDownload: (item: DocumentShowcaseItem) => Promise<void>
  downloadErrorText: string
  className?: string
}

export function DocumentShowcase({
  heading,
  items,
  getSummary,
  getDownloadLabel,
  onDownload,
  downloadErrorText,
  className,
}: DocumentShowcaseProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    if (!items.length) {
      setActiveIndex(0)
      setViewerIndex(null)
      return
    }

    setActiveIndex((current) => Math.min(current, items.length - 1))
    setViewerIndex((current) =>
      current === null ? null : Math.min(current, items.length - 1),
    )
  }, [items.length])

  if (!items.length) {
    return null
  }

  const safeIndex = Math.min(activeIndex, items.length - 1)
  const activeItem = items[safeIndex]
  const activeSummary = getSummary(activeItem)
  const viewerItem =
    viewerIndex === null ? null : items[Math.min(viewerIndex, items.length - 1)] ?? null
  const sectionClassName = className
    ? `${styles.showcaseSection} ${className}`
    : styles.showcaseSection

  function moveActive(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + items.length) % items.length)
    setDownloadError(null)
  }

  function moveViewer(direction: -1 | 1) {
    setViewerIndex((current) => {
      if (current === null) {
        return current
      }

      return (current + direction + items.length) % items.length
    })
  }

  async function handleDownload() {
    if (isDownloading) {
      return
    }

    setIsDownloading(true)
    setDownloadError(null)

    try {
      await onDownload(activeItem)
    } catch {
      setDownloadError(downloadErrorText)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <section className={sectionClassName}>
      <div className={styles.showcaseHeader}>
        <div className={styles.showcaseTitle}>
          <span className={styles.showcaseIcon} aria-hidden="true" />
          <h2>{heading}</h2>
        </div>

        {items.length > 1 ? (
          <div className={styles.showcaseControls}>
            <button
              type="button"
              className={styles.showcaseControl}
              onClick={() => moveActive(-1)}
            >
              {t('common.previous')}
            </button>
            <span>
              {safeIndex + 1} / {items.length}
            </span>
            <button
              type="button"
              className={styles.showcaseControl}
              onClick={() => moveActive(1)}
            >
              {t('common.next')}
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className={[
          styles.showcaseSlide,
          !isImageDocument(activeItem) ? styles.showcaseDocumentSlide : '',
          isPdfDocument(activeItem) ? styles.showcasePdfSlide : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setViewerIndex(safeIndex)}
        aria-label={activeItem.title}
      >
        {isImageDocument(activeItem) ? (
          <img src={activeItem.previewUrl} alt={activeItem.title} />
        ) : (
          <span className={styles.showcaseDocumentPreview} aria-hidden="true" />
        )}
        {isImageDocument(activeItem) ? (
          <span className={styles.showcaseShade} aria-hidden="true" />
        ) : null}
        <span className={styles.showcaseFileBadge}>{activeItem.badgeLabel}</span>
      </button>

      <div className={styles.showcaseDownloadCard}>
        <div>
          <h3>{activeSummary.title}</h3>
          {activeSummary.description ? <p>{activeSummary.description}</p> : null}
        </div>
        <button
          type="button"
          className={styles.showcaseDownloadAction}
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <span className={styles.showcaseDownloadIcon} aria-hidden="true" />
          {isDownloading ? t('common.loading') : getDownloadLabel(activeItem)}
        </button>
      </div>
      {downloadError ? <p className={styles.showcaseDownloadError}>{downloadError}</p> : null}

      {viewerItem ? (
        <DocumentViewerModal
          title={viewerItem.title}
          previewUrl={viewerItem.previewUrl}
          mimeType={viewerItem.mimeType}
          onClose={() => setViewerIndex(null)}
          controls={
            items.length > 1 ? (
              <>
                <button type="button" onClick={() => moveViewer(-1)}>
                  {t('common.previous')}
                </button>
                <span>
                  {(viewerIndex ?? 0) + 1} / {items.length}
                </span>
                <button type="button" onClick={() => moveViewer(1)}>
                  {t('common.next')}
                </button>
              </>
            ) : undefined
          }
        />
      ) : null}
    </section>
  )
}

function isImageDocument(item?: Pick<DocumentShowcaseItem, 'mimeType'> | null) {
  return Boolean(item?.mimeType.toLowerCase().startsWith('image/'))
}

function isPdfDocument(item?: Pick<DocumentShowcaseItem, 'mimeType'> | null) {
  return item?.mimeType.toLowerCase() === 'application/pdf'
}
