import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const activePreview = resolveInlinePreview(activeItem)
  const viewerItem =
    viewerIndex === null ? null : items[Math.min(viewerIndex, items.length - 1)] ?? null
  const viewerPreviewUrl = viewerItem ? resolveViewerPreviewUrl(viewerItem) : null
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

      <div
        className={[
          styles.showcaseSlide,
          activePreview.kind !== 'image' ? styles.showcaseDocumentSlide : '',
          isPdfDocument(activeItem) ? styles.showcasePdfSlide : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {activePreview.kind === 'image' ? (
          <img src={activeItem.previewUrl} alt={activeItem.title} />
        ) : activePreview.kind === 'iframe' ? (
          <iframe
            title={`${activeItem.title} preview`}
            src={activePreview.url}
            className={styles.showcasePreviewFrame}
            loading="lazy"
            tabIndex={-1}
          />
        ) : (
          <span className={styles.showcaseDocumentPreview} aria-hidden="true" />
        )}
        {activePreview.kind === 'image' ? (
          <span className={styles.showcaseShade} aria-hidden="true" />
        ) : null}
        <button
          type="button"
          className={styles.showcasePreviewButton}
          onClick={() => setViewerIndex(safeIndex)}
          aria-label={activeItem.title}
        />
        <span className={styles.showcaseFileBadge}>{activeItem.badgeLabel}</span>
      </div>

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
        <div
          className={styles.viewerOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={viewerItem.title}
        >
          <div className={styles.viewerPanel}>
            <div className={styles.viewerHeader}>
              <strong>{viewerItem.title}</strong>
              <button type="button" onClick={() => setViewerIndex(null)}>
                {t('common.close')}
              </button>
            </div>

            <div className={styles.viewerStage}>
              {isImageDocument(viewerItem) ? (
                <img src={viewerItem.previewUrl} alt={viewerItem.title} />
              ) : viewerPreviewUrl ? (
                <iframe title={viewerItem.title} src={viewerPreviewUrl} />
              ) : (
                <div className={styles.viewerFallback}>
                  <span className={styles.viewerFallbackBadge}>{viewerItem.badgeLabel}</span>
                </div>
              )}
            </div>

            {items.length > 1 ? (
              <div className={styles.viewerControls}>
                <button type="button" onClick={() => moveViewer(-1)}>
                  {t('common.previous')}
                </button>
                <span>
                  {(viewerIndex ?? 0) + 1} / {items.length}
                </span>
                <button type="button" onClick={() => moveViewer(1)}>
                  {t('common.next')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function isImageDocument(
  item?: Pick<DocumentShowcaseItem, 'mimeType' | 'downloadFileName'> | null,
) {
  return Boolean(
    getMimeType(item).startsWith('image/') ||
      IMAGE_EXTENSIONS.includes(getFileExtension(item)),
  )
}

function isPdfDocument(
  item?: Pick<DocumentShowcaseItem, 'mimeType' | 'downloadFileName'> | null,
) {
  const mimeType = getMimeType(item)
  return mimeType === 'application/pdf' || getFileExtension(item) === 'pdf'
}

function isHtmlDocument(
  item?: Pick<DocumentShowcaseItem, 'mimeType' | 'downloadFileName'> | null,
) {
  const mimeType = getMimeType(item)
  const extension = getFileExtension(item)
  return mimeType.includes('html') || extension === 'html' || extension === 'htm'
}

function isOfficeDocument(
  item?: Pick<DocumentShowcaseItem, 'mimeType' | 'downloadFileName'> | null,
) {
  return OFFICE_MIME_TYPES.has(getMimeType(item)) || OFFICE_EXTENSIONS.has(getFileExtension(item))
}

function resolveInlinePreview(
  item: Pick<DocumentShowcaseItem, 'previewUrl' | 'mimeType' | 'downloadFileName'>,
) {
  if (isImageDocument(item)) {
    return {
      kind: 'image' as const,
      url: item.previewUrl,
    }
  }

  const viewerPreviewUrl = resolveViewerPreviewUrl(item)
  if (viewerPreviewUrl && (isPdfDocument(item) || isHtmlDocument(item) || isOfficeDocument(item))) {
    return {
      kind: 'iframe' as const,
      url: viewerPreviewUrl,
    }
  }

  return {
    kind: 'placeholder' as const,
    url: null,
  }
}

function resolveViewerPreviewUrl(
  item: Pick<DocumentShowcaseItem, 'previewUrl' | 'mimeType' | 'downloadFileName'>,
) {
  if (isOfficeDocument(item)) {
    if (!/^https?:\/\//i.test(item.previewUrl)) {
      return null
    }

    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      item.previewUrl,
    )}`
  }

  return item.previewUrl
}

function getMimeType(item?: Pick<DocumentShowcaseItem, 'mimeType'> | null) {
  return item?.mimeType.toLowerCase().trim() ?? ''
}

function getFileExtension(
  item?: Pick<DocumentShowcaseItem, 'downloadFileName'> | null,
) {
  return item?.downloadFileName.split('.').pop()?.trim().toLowerCase() ?? ''
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']

const OFFICE_EXTENSIONS = new Set([
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'rtf',
  'odt',
  'ods',
  'odp',
])

const OFFICE_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/rtf',
  'text/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
])
