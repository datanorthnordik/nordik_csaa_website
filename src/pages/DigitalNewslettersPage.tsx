import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  newslettersApi,
  type NewsletterDetailResponse,
} from '../api/newslettersApi'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import {
  getNewsletterCategoryLabel,
  getNewsletterYear,
  resolveNewsletterPreview,
  type NewsletterResolvedPreview,
} from '../lib/newsletterMedia'
import { TextHero } from '../components/TextHero'
import styles from './DigitalNewslettersPage.module.css'

type LoadStatus = 'loading' | 'ready' | 'error'

export function DigitalNewslettersPage() {
  const { i18n, t } = useTranslation()
  const [entries, setEntries] = useState<NewsletterDetailResponse[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const locale = i18n.resolvedLanguage ?? i18n.language

  useEffect(() => {
    let ignore = false

    async function loadEntries() {
      setStatus('loading')

      try {
        const response = await newslettersApi.listPublishedNewsletters()
        if (!ignore) {
          setEntries(
            [...response].sort(
              (left, right) =>
                new Date(right.send_date).getTime() - new Date(left.send_date).getTime(),
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

  const years = Array.from(new Set(entries.map((entry) => getNewsletterYear(entry.send_date))))
    .filter(Boolean)
    .sort((left, right) => Number(right) - Number(left))
  const featuredEntry = entries[0] ?? null
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredEntries = entries.filter((entry) => {
    const matchesYear =
      selectedYear === 'all' || getNewsletterYear(entry.send_date) === selectedYear

    if (!matchesYear) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    const preview = resolveNewsletterPreview(entry)
    const media = Array.isArray(entry.media) ? entry.media : []
    const searchableParts = [
      entry.title,
      entry.category,
      preview.excerpt,
      ...media.map((item) => `${item.display_name} ${item.file_name}`),
    ]

    return searchableParts.some((value) => value.toLowerCase().includes(normalizedSearch))
  })

  const listEntries =
    featuredEntry && !normalizedSearch && selectedYear === 'all'
      ? filteredEntries.filter((entry) => entry.id !== featuredEntry.id)
      : filteredEntries

  usePageBreadcrumbs([
    {
      label: t('newsMediaPage.hero.title'),
      href: '/news-media',
    },
    {
      label: t('newslettersPage.hero.title'),
    },
  ])

  return (
    <div className={styles.page}>
      <TextHero
        eyebrow={t('newslettersPage.hero.eyebrow')}
        title={t('newslettersPage.hero.title')}
        description={t('newslettersPage.hero.descriptionLead')}
      />

      <section className={styles.controls} aria-label={t('newslettersPage.filters.label')}>
        <div className={styles.yearFilters}>
          <button
            type="button"
            className={`${styles.filterChip} ${
              selectedYear === 'all' ? styles.filterChipActive : ''
            }`}
            onClick={() => setSelectedYear('all')}
          >
            {t('newslettersPage.filters.all')}
          </button>

          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={`${styles.filterChip} ${
                selectedYear === year ? styles.filterChipActive : ''
              }`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <label className={styles.searchField}>
          <span className={styles.visuallyHidden}>
            {t('newslettersPage.filters.searchLabel')}
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('newslettersPage.filters.searchPlaceholder')}
            aria-label={t('newslettersPage.filters.searchLabel')}
          />
          <span className={styles.searchIcon} aria-hidden="true" />
        </label>
      </section>

      {status === 'ready' && featuredEntry && !normalizedSearch && selectedYear === 'all' ? (
        <section className={styles.featuredSection}>
          <div className={styles.featuredCallout}>
            <p className={styles.featuredCalloutLabel}>{t('newslettersPage.hero.featuredLabel')}</p>
            <h2 className={styles.featuredCalloutHeading}>Dive Into Our Latest Update.</h2>
            <p className={styles.featuredCalloutDesc}>
              Click the edition on the right to read and stay connected with the heartbeat of our association.
            </p>
            <p className={styles.featuredCalloutBody}>
              Explore our latest stories of resilience, upcoming cultural gatherings, and the vital community outreach initiatives driving our mission forward this month.
            </p>
          </div>
          <FeaturedNewsletterCard entry={featuredEntry} locale={locale} />
        </section>
      ) : null}

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
            <h2>{t('newslettersPage.states.errorTitle')}</h2>
            <p>{t('newslettersPage.states.errorDescription')}</p>
          </div>
        ) : null}

        {status === 'ready' && !filteredEntries.length ? (
          <div className={styles.stateCard}>
            <h2>{t('newslettersPage.states.emptyTitle')}</h2>
            <p>{t('newslettersPage.states.emptyDescription')}</p>
          </div>
        ) : null}

        {status === 'ready' && listEntries.length ? (
          <div className={styles.list}>
            {listEntries.map((entry) => (
              <NewsletterCard key={entry.id} entry={entry} locale={locale} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function FeaturedNewsletterCard({
  entry,
  locale,
}: {
  entry: NewsletterDetailResponse
  locale: string
}) {
  const { t } = useTranslation()
  const preview = resolveNewsletterPreview(entry)

  return (
    <article className={`${styles.card} ${styles.featuredCard}`}>
      <NewsletterPreviewSurface
        entry={entry}
        preview={preview}
        title={entry.title}
        variant="featured"
      />

      <div className={styles.featuredContent}>
        <div className={styles.metaRow}>
          <span className={styles.metaChip}>{t('newslettersPage.hero.featuredLabel')}</span>
          <span className={styles.metaText}>{formatNewsletterDate(entry.send_date, locale)}</span>
          <span className={styles.metaText}>{getNewsletterCategoryLabel(entry.category)}</span>
        </div>

        <h2 className={styles.featuredTitle}>{entry.title}</h2>
        {preview.excerpt ? <p className={styles.featuredExcerpt}>{preview.excerpt}</p> : null}
        <span className={styles.readLink}>{t('newslettersPage.card.readEdition')}</span>
      </div>

      <Link
        to={`/news-media/digital-newsletter/${entry.id}`}
        className={styles.cardHitArea}
        target="_blank"
        rel="noreferrer"
        aria-label={t('newslettersPage.card.openEdition', { title: entry.title })}
      />
    </article>
  )
}

function NewsletterCard({
  entry,
  locale,
}: {
  entry: NewsletterDetailResponse
  locale: string
}) {
  const { t } = useTranslation()
  const preview = resolveNewsletterPreview(entry)

  return (
    <article className={styles.card}>
      <NewsletterPreviewSurface
        entry={entry}
        preview={preview}
        title={entry.title}
        variant="list"
      />

      <div className={styles.cardContent}>
        <div className={styles.metaRow}>
          <span className={styles.metaChip}>
            {entry.category
              ? getNewsletterCategoryLabel(entry.category)
              : t('newslettersPage.card.issueLabel')}
          </span>
          <span className={styles.metaText}>{formatNewsletterDate(entry.send_date, locale)}</span>
          <span className={styles.metaText}>{preview.fileTypeLabel}</span>
        </div>

        <h2 className={styles.cardTitle}>{entry.title}</h2>
        {preview.excerpt ? <p className={styles.cardExcerpt}>{preview.excerpt}</p> : null}

        <div className={styles.cardFooter}>
          <span className={styles.readLink}>{t('newslettersPage.card.readEdition')}</span>
        </div>
      </div>

      <Link
        to={`/news-media/digital-newsletter/${entry.id}`}
        className={styles.cardHitArea}
        target="_blank"
        rel="noreferrer"
        aria-label={t('newslettersPage.card.openEdition', { title: entry.title })}
      />
    </article>
  )
}

function NewsletterPreviewSurface({
  entry,
  preview,
  title,
  variant,
}: {
  entry: NewsletterDetailResponse
  preview: NewsletterResolvedPreview
  title: string
  variant: 'featured' | 'list'
}) {
  const { t } = useTranslation()

  return (
    <div
      className={`${styles.previewSurface} ${
        variant === 'featured' ? styles.previewFeatured : styles.previewList
      }`}
      aria-hidden="true"
    >
      {variant === 'featured' ? (
        <div className={styles.featuredArtwork}>
          <div className={styles.featuredArtworkGlow} />
          <div className={styles.featuredArtworkCard}>
            <span className={styles.featuredArtworkEyebrow}>
              {t('newslettersPage.hero.featuredLabel')}
            </span>
            <strong className={styles.featuredArtworkTitle}>
              {t('newslettersPage.hero.title')}
            </strong>
            <span className={styles.featuredArtworkMeta}>
              {getNewsletterCategoryLabel(entry.category)} · {formatNewsletterMonth(entry.send_date)}
            </span>
            <div className={styles.featuredArtworkLines} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={styles.featuredArtworkSheet} aria-hidden="true" />
          <div className={styles.featuredArtworkSheetAccent} aria-hidden="true" />
        </div>
      ) : null}

      {variant === 'list' && preview.previewKind === 'image' && preview.previewUrl ? (
        <img src={preview.previewUrl} alt={title} className={styles.previewImage} />
      ) : null}

      {variant === 'list' && preview.previewKind === 'iframe' && preview.previewUrl ? (
        <iframe
          src={preview.previewUrl}
          title={t('newslettersPage.card.previewFrameTitle', { title })}
          className={styles.previewFrame}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : null}

      {variant === 'list' && preview.previewKind === 'placeholder' ? (
        <div className={styles.previewPlaceholder}>
          <span>{preview.fileTypeLabel}</span>
        </div>
      ) : null}

      <div className={styles.previewShade} />
      <div className={styles.previewCaption}>
        <strong>{title}</strong>
        <span>{formatNewsletterMonth(entry.send_date)}</span>
      </div>
    </div>
  )
}

function formatNewsletterDate(value: string, locale: string) {
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

function formatNewsletterMonth(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}
