import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  newslettersApi,
  type NewsletterDetailResponse,
} from '../api/newslettersApi'
import { NewsletterFlipbook } from '../components/newsletters/NewsletterFlipbook'
import {
  getNewsletterCategoryLabel,
  resolveNewsletterDownload,
  resolveNewsletterFlipbook,
  resolveNewsletterPreview,
} from '../lib/newsletterMedia'
import { downloadPublicFile } from '../lib/fileDownload'
import styles from './DigitalNewsletterDetailPage.module.css'

type LoadStatus = 'loading' | 'ready' | 'error'

export function DigitalNewsletterDetailPage() {
  const { newsletterId } = useParams()
  const { i18n, t } = useTranslation()
  const [entry, setEntry] = useState<NewsletterDetailResponse | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const locale = i18n.resolvedLanguage ?? i18n.language

  useEffect(() => {
    const id = Number(newsletterId)
    if (!Number.isFinite(id) || id <= 0) {
      setEntry(null)
      setStatus('error')
      return
    }

    let ignore = false

    async function loadEntry() {
      setStatus('loading')

      try {
        const response = await newslettersApi.getNewsletter(id)
        if (!ignore) {
          setEntry(response)
          setStatus('ready')
        }
      } catch {
        if (!ignore) {
          setEntry(null)
          setStatus('error')
        }
      }
    }

    void loadEntry()

    return () => {
      ignore = true
    }
  }, [newsletterId])

  const preview = useMemo(() => (entry ? resolveNewsletterPreview(entry) : null), [entry])
  const flipbookSource = useMemo(
    () => (entry ? resolveNewsletterFlipbook(entry) : null),
    [entry],
  )
  const downloadTarget = useMemo(
    () => (entry ? resolveNewsletterDownload(entry) : null),
    [entry],
  )
  const hasImagePreview = Boolean(
    preview?.previewKind === 'image' && preview.previewUrl,
  )
  const hasInlineFramePreview = Boolean(
    preview?.previewKind === 'iframe' && preview.previewUrl && !flipbookSource,
  )
  const showHeroMedia = hasImagePreview || hasInlineFramePreview

  async function handleDownload() {
    if (!downloadTarget || isDownloading) {
      return
    }

    setDownloadError(null)
    setIsDownloading(true)

    try {
      await downloadPublicFile(downloadTarget.url, downloadTarget.fileName)
    } catch {
      setDownloadError(t('newslettersPage.detail.downloadError'))
    } finally {
      setIsDownloading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.loadingCard} aria-busy="true">
          <div className={styles.loadingPulse} aria-hidden="true" />
          <p>{t('newslettersPage.detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (status === 'error' || !entry) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <h1>{t('newslettersPage.detail.errorTitle')}</h1>
          <p>{t('newslettersPage.detail.errorDescription')}</p>
          <Link to="/news-media/digital-newsletter" className={styles.backLink}>
            {t('newslettersPage.detail.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/news-media/digital-newsletter" className={styles.backLink}>
          {t('newslettersPage.detail.backToList')}
        </Link>
      </div>

      <section className={styles.hero}>
        <div className={`${styles.heroLayout} ${!showHeroMedia ? styles.heroLayoutCompact : ''}`}>
          <div className={styles.heroCopy}>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>
                {getNewsletterCategoryLabel(entry.category)}
              </span>
              <span className={styles.metaText}>
                {formatNewsletterDate(entry.send_date, locale)}
              </span>
            </div>

            <h1 className={styles.heroTitle}>{entry.title}</h1>

            {entry.content_html.trim() ? (
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: entry.content_html }}
              />
            ) : preview?.excerpt ? (
              <p className={styles.fallbackDescription}>{preview.excerpt}</p>
            ) : (
              <p className={styles.fallbackDescription}>
                {t('newslettersPage.detail.noDescription')}
              </p>
            )}

            {downloadTarget ? (
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.downloadButton}
                  onClick={() => void handleDownload()}
                  disabled={isDownloading}
                >
                  <span aria-hidden="true" className={styles.downloadIcon} />
                  {t('newslettersPage.detail.downloadEdition')}
                </button>
              </div>
            ) : null}

            {downloadError ? <p className={styles.downloadError}>{downloadError}</p> : null}
          </div>

          {showHeroMedia ? (
            <div className={styles.heroMedia}>
              {hasImagePreview ? (
                <img
                  src={preview?.previewUrl ?? ''}
                  alt={entry.title}
                  className={styles.coverImage}
                />
              ) : hasInlineFramePreview ? (
                <iframe
                  src={preview?.previewUrl ?? ''}
                  title={t('newslettersPage.card.previewFrameTitle', { title: entry.title })}
                  className={styles.coverFrame}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {flipbookSource ? (
        <section className={styles.readerSection}>
          <NewsletterFlipbook source={flipbookSource} title={entry.title} />
        </section>
      ) : null}
    </div>
  )
}

function formatNewsletterDate(value: string, locale: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}
