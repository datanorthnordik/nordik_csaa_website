import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { pressApi, type PressDetailResponse } from '../api/pressApi'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { downloadPublicFile } from '../lib/fileDownload'
import {
  getPressYear,
  resolvePressDownloads,
  resolvePressPreview,
  type PressDownloadItem,
  type PressResolvedPreview,
} from '../lib/pressMedia'
import { TextHero } from '../components/TextHero'
import styles from './PressArchivePage.module.css'

type LoadStatus = 'loading' | 'ready' | 'error'

export function PressArchivePage() {
  const { i18n, t } = useTranslation()
  const [entries, setEntries] = useState<PressDetailResponse[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [customYear, setCustomYear] = useState('')

  const locale = i18n.resolvedLanguage ?? i18n.language

  useEffect(() => {
    let ignore = false

    async function loadEntries() {
      setStatus('loading')

      try {
        const response = await pressApi.listPublishedPressEntries()
        if (!ignore) {
          setEntries(
            [...response].sort(
              (left, right) =>
                new Date(right.release_date).getTime() - new Date(left.release_date).getTime(),
            ),
          )
          setStatus('ready')
        }
      } catch {
        if (!ignore) {
          setEntries([])
          setStatus('error')
        }
      }
    }

    void loadEntries()

    return () => {
      ignore = true
    }
  }, [])

  const years = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => getPressYear(entry.release_date))))
        .filter(Boolean)
        .sort((left, right) => Number(right) - Number(left)),
    [entries],
  )
  const featuredYears = years.slice(0, 4)
  const normalizedCustomYear = customYear.trim()
  const activeYear = normalizedCustomYear.length === 4 ? normalizedCustomYear : selectedYear
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredEntries = entries.filter((entry) => {
    const matchesYear =
      activeYear === 'all' || getPressYear(entry.release_date) === activeYear

    if (!matchesYear) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    const preview = resolvePressPreview(entry)
    const searchableParts = [
      entry.title ?? '',
      entry.source_url ?? '',
      preview.excerpt,
      ...(Array.isArray(entry.media)
        ? entry.media.map((item) => `${item.display_name ?? ''} ${item.file_name ?? ''}`)
        : []),
    ]

    return searchableParts.some((value) => value.toLowerCase().includes(normalizedSearch))
  })

  usePageBreadcrumbs([
    {
      label: t('newsMediaPage.hero.title'),
      href: '/news-media',
    },
    {
      label: t('pressArchivePage.hero.title'),
    },
  ])

  return (
    <div className={styles.page}>
      <TextHero
        eyebrow={t('pressArchivePage.hero.eyebrow')}
        title={t('pressArchivePage.hero.title')}
        description={t('pressArchivePage.hero.descriptionLead')}
      />

      <section className={styles.controls} aria-label={t('pressArchivePage.filters.label')}>
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterChip} ${
              activeYear === 'all' && !normalizedCustomYear ? styles.filterChipActive : ''
            }`}
            onClick={() => {
              setSelectedYear('all')
              setCustomYear('')
            }}
          >
            {t('pressArchivePage.filters.all')}
          </button>

          {featuredYears.map((year) => (
            <button
              key={year}
              type="button"
              className={`${styles.filterChip} ${
                activeYear === year && !normalizedCustomYear ? styles.filterChipActive : ''
              }`}
              onClick={() => {
                setSelectedYear(year)
                setCustomYear('')
              }}
            >
              {year}
            </button>
          ))}

          <label className={styles.yearInputGroup}>
            <span className={styles.visuallyHidden}>
              {t('pressArchivePage.filters.olderYearLabel')}
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={customYear}
              onChange={(event) => {
                setCustomYear(event.target.value.replace(/\D/g, '').slice(0, 4))
                setSelectedYear('all')
              }}
              placeholder={t('pressArchivePage.filters.olderYearPlaceholder')}
              aria-label={t('pressArchivePage.filters.olderYearLabel')}
            />
          </label>

          {normalizedCustomYear ? (
            <button
              type="button"
              className={styles.clearYearButton}
              onClick={() => setCustomYear('')}
            >
              {t('pressArchivePage.filters.clearYear')}
            </button>
          ) : null}
        </div>

        <label className={styles.searchField}>
          <span className={styles.visuallyHidden}>
            {t('pressArchivePage.filters.searchLabel')}
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('pressArchivePage.filters.searchPlaceholder')}
            aria-label={t('pressArchivePage.filters.searchLabel')}
          />
          <span className={styles.searchIcon} aria-hidden="true" />
        </label>
      </section>

      <section className={styles.listSection}>
        {status === 'loading' ? (
          <div className={styles.list}>
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className={styles.cardSkeleton} aria-hidden="true" />
            ))}
          </div>
        ) : null}

        {status === 'error' ? (
          <div className={styles.stateCard}>
            <h2>{t('pressArchivePage.states.errorTitle')}</h2>
            <p>{t('pressArchivePage.states.errorDescription')}</p>
          </div>
        ) : null}

        {status === 'ready' && !filteredEntries.length ? (
          <div className={styles.stateCard}>
            <h2>{t('pressArchivePage.states.emptyTitle')}</h2>
            <p>{t('pressArchivePage.states.emptyDescription')}</p>
          </div>
        ) : null}

        {status === 'ready' && filteredEntries.length ? (
          <div className={styles.list}>
            {filteredEntries.map((entry) => (
              <PressArchiveCard key={entry.id} entry={entry} locale={locale} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function PressArchiveCard({
  entry,
  locale,
}: {
  entry: PressDetailResponse
  locale: string
}) {
  const { t } = useTranslation()
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const preview = resolvePressPreview(entry)
  const downloads = resolvePressDownloads(entry)
  const sourceUrl = typeof entry.source_url === 'string' ? entry.source_url.trim() : ''
  const hasSource = Boolean(sourceUrl)
  const linkLabel = hasSource
    ? t('pressArchivePage.card.openSource')
    : t('pressArchivePage.card.readArchive')

  async function handleDownload(item: PressDownloadItem) {
    setDownloadError(null)
    setDownloadingId(item.id)

    try {
      await downloadPublicFile(item.downloadUrl, item.downloadFileName)
    } catch {
      setDownloadError(t('pressArchivePage.detail.downloadError'))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        {hasSource ? (
          <a
            href={sourceUrl}
            className={styles.cardMain}
            target="_blank"
            rel="noreferrer"
            aria-label={`${entry.title} ${linkLabel}`}
          >
            <PressPreviewSurface entry={entry} preview={preview} />
            <div className={styles.cardContent}>
              <div className={styles.metaRow}>
                <span className={styles.metaChip}>{t('pressArchivePage.card.archiveLabel')}</span>
                <span className={styles.metaText}>
                  {formatPressDate(entry.release_date, locale)}
                </span>
                <span className={styles.metaText}>{preview.fileTypeLabel}</span>
              </div>

              <h2 className={styles.cardTitle}>{entry.title}</h2>
              {preview.excerpt ? <p className={styles.cardExcerpt}>{preview.excerpt}</p> : null}

              <div className={styles.cardFooter}>
                <span className={styles.readLink}>{linkLabel}</span>
              </div>
            </div>
          </a>
        ) : (
          <Link
            to={`/news-media/press-archive/${entry.id}`}
            className={styles.cardMain}
            target="_blank"
            rel="noreferrer"
            aria-label={`${entry.title} ${linkLabel}`}
          >
            <PressPreviewSurface entry={entry} preview={preview} />
            <div className={styles.cardContent}>
              <div className={styles.metaRow}>
                <span className={styles.metaChip}>{t('pressArchivePage.card.archiveLabel')}</span>
                <span className={styles.metaText}>
                  {formatPressDate(entry.release_date, locale)}
                </span>
                <span className={styles.metaText}>{preview.fileTypeLabel}</span>
              </div>

              <h2 className={styles.cardTitle}>{entry.title}</h2>
              {preview.excerpt ? <p className={styles.cardExcerpt}>{preview.excerpt}</p> : null}

              <div className={styles.cardFooter}>
                <span className={styles.readLink}>{linkLabel}</span>
              </div>
            </div>
          </Link>
        )}

        {downloads.length ? (
          <div className={styles.attachmentColumn}>
            <div className={styles.attachmentRow}>
              {downloads.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.attachmentButton}
                  onClick={() => void handleDownload(item)}
                  disabled={downloadingId === item.id}
                  aria-label={`${t('pressArchivePage.card.downloadAttachment')} ${item.title}`}
                >
                  {downloadingId === item.id
                    ? t('common.loading')
                    : t('pressArchivePage.card.downloadAttachment')}
                </button>
              ))}

              {downloads.length > 3 ? (
                <span className={styles.moreAttachments}>
                  {t('pressArchivePage.card.moreAttachments', {
                    count: downloads.length - 3,
                  })}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {downloadError ? <p className={styles.downloadError}>{downloadError}</p> : null}
    </article>
  )
}

function PressPreviewSurface({
  entry,
  preview,
}: {
  entry: PressDetailResponse
  preview: PressResolvedPreview
}) {
  const { t } = useTranslation()

  return (
    <div className={styles.previewSurface} aria-hidden="true">
      {preview.previewKind === 'image' && preview.previewUrl ? (
        <img src={preview.previewUrl} alt={entry.title} className={styles.previewImage} />
      ) : null}

      {preview.previewKind === 'placeholder' ? (
        <div className={styles.previewPlaceholder}>
          <div className={styles.previewPlaceholderSheet}>
            <span className={styles.previewPlaceholderEyebrow}>
              {t('pressArchivePage.card.archiveLabel')}
            </span>
            <strong className={styles.previewPlaceholderTitle}>{entry.title}</strong>
            <div className={styles.previewPlaceholderLines} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <span className={styles.previewPlaceholderBadge}>{preview.fileTypeLabel}</span>
        </div>
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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}
