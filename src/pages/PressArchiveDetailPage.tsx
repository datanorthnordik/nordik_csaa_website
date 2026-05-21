import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { pressApi, type PressDetailResponse } from '../api/pressApi'
import {
  DocumentShowcase,
  type DocumentShowcaseItem,
} from '../components/documents/DocumentShowcase'
import { downloadPublicFile } from '../lib/fileDownload'
import {
  isPdfPressMedia,
  resolvePressDownloads,
  resolvePressHeroImage,
} from '../lib/pressMedia'
import styles from './PressArchiveDetailPage.module.css'

type LoadStatus = 'loading' | 'ready' | 'error'

export function PressArchiveDetailPage() {
  const { pressId } = useParams()
  const { i18n, t } = useTranslation()
  const [entry, setEntry] = useState<PressDetailResponse | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  const locale = i18n.resolvedLanguage ?? i18n.language

  useEffect(() => {
    const id = Number(pressId)
    if (!Number.isFinite(id) || id <= 0) {
      setEntry(null)
      setStatus('error')
      return
    }

    let ignore = false

    async function loadEntry() {
      setStatus('loading')

      try {
        const response = await pressApi.getPressEntry(id)
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
  }, [pressId])

  const heroImage = useMemo(
    () => (entry ? resolvePressHeroImage(entry) : null),
    [entry],
  )
  const contentHtml = entry?.content_html.trim() ?? ''
  const documentItems = useMemo<DocumentShowcaseItem[]>(
    () =>
      entry
        ? resolvePressDownloads(entry).map((item) => ({
            id: item.id,
            title: item.title,
            description: '',
            previewUrl: item.downloadUrl,
            downloadUrl: item.downloadUrl,
            downloadFileName: item.downloadFileName,
            badgeLabel: item.badgeLabel,
            mimeType: item.mimeType,
          }))
        : [],
    [entry],
  )

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <p>{t('pressArchivePage.detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (status === 'error' || !entry) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <h1>{t('pressArchivePage.detail.errorTitle')}</h1>
          <p>{t('pressArchivePage.detail.errorDescription')}</p>
          <Link to="/news-media/press-archive" className={styles.backLink}>
            {t('pressArchivePage.detail.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Link to="/news-media/press-archive" className={styles.backLink}>
        {t('pressArchivePage.detail.backToList')}
      </Link>

      <section className={styles.hero}>
        <div className={`${styles.heroLayout} ${!heroImage ? styles.heroLayoutCompact : ''}`}>
          <div className={styles.heroCopy}>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>{t('pressArchivePage.card.archiveLabel')}</span>
              <span className={styles.metaText}>
                {formatPressDate(entry.release_date, locale)}
              </span>
            </div>

            <h1 className={styles.heroTitle}>{entry.title}</h1>

            {contentHtml ? (
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : null}

            {typeof entry.source_url === 'string' && entry.source_url.trim() ? (
              <a
                href={entry.source_url.trim()}
                className={styles.sourceAction}
              >
                {t('pressArchivePage.detail.sourceAction')}
              </a>
            ) : null}
          </div>

          {heroImage ? (
            <div className={styles.heroMedia}>
              <img src={heroImage} alt={entry.title} className={styles.heroImage} />
            </div>
          ) : null}
        </div>
      </section>

      {documentItems.length ? (
        <section className={styles.documentsSection}>
          <DocumentShowcase
            heading={t('pressArchivePage.detail.documentsTitle')}
            items={documentItems}
            getSummary={(item) => ({
              title: item.title,
              description: '',
            })}
            getDownloadLabel={(item) =>
              isPdfPressMedia({ mime_type: item.mimeType, file_name: item.downloadFileName })
                ? t('pressArchivePage.detail.downloadPdf')
                : t('pressArchivePage.detail.downloadDocument')
            }
            onDownload={(item) => downloadPublicFile(item.downloadUrl, item.downloadFileName)}
            downloadErrorText={t('pressArchivePage.detail.downloadError')}
          />
        </section>
      ) : null}
    </div>
  )
}

function formatPressDate(value: string, locale: string) {
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
