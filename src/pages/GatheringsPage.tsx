import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import {
  eventsApi,
  type EventDetailResponse,
  type EventListPageMeta,
} from '../api/eventsApi'
import {
  buildVenueLabel,
  formatEventBadgeDay,
  formatEventBadgeMonth,
  formatEventDateRange,
  formatEventTimeRange,
  getRegistrationState,
} from '../lib/eventsDate'
import { isImageMedia, resolveEventMediaUrl } from '../lib/eventMedia'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import styles from './GatheringsPage.module.css'

const PAGE_SIZE = 10

export function GatheringsPage() {
  const { i18n, t } = useTranslation()
  const [upcomingEvents, setUpcomingEvents] = useState<EventDetailResponse[]>([])
  const [archivedEvents, setArchivedEvents] = useState<EventDetailResponse[]>([])
  const [archivePagination, setArchivePagination] = useState<EventListPageMeta | null>(null)
  const [upcomingVisibleCount, setUpcomingVisibleCount] = useState(PAGE_SIZE)
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true)
  const [isArchiveLoading, setIsArchiveLoading] = useState(true)
  const [isArchiveLoadingMore, setIsArchiveLoadingMore] = useState(false)
  const [upcomingError, setUpcomingError] = useState<string | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const locale = i18n.resolvedLanguage ?? i18n.language
  const [currentApiDate] = useState(() => getCurrentApiDate())
  const [archiveReferenceDate] = useState(() => getYesterdayApiDate())
  const visibleUpcomingEvents = useMemo(
    () => upcomingEvents.slice(0, upcomingVisibleCount),
    [upcomingEvents, upcomingVisibleCount],
  )
  const hasMoreUpcomingEvents = upcomingEvents.length > visibleUpcomingEvents.length
  const hasMoreArchivedEvents = archivePagination?.has_next ?? false

  usePageBreadcrumbs([
    {
      label: t('site.nav.gatherings'),
    },
  ])

  useEffect(() => {
    let ignore = false

    async function loadUpcomingEvents() {
      setIsUpcomingLoading(true)
      setUpcomingError(null)

      try {
        const response = await eventsApi.listUpcomingEvents(currentApiDate)
        if (!ignore) {
          setUpcomingEvents(response.items)
          setUpcomingVisibleCount(PAGE_SIZE)
        }
      } catch (error) {
        if (!ignore) {
          setUpcomingError(getErrorMessage(error))
        }
      } finally {
        if (!ignore) {
          setIsUpcomingLoading(false)
        }
      }
    }

    void loadUpcomingEvents()

    return () => {
      ignore = true
    }
  }, [currentApiDate])

  useEffect(() => {
    let ignore = false

    async function loadArchivedEvents() {
      setIsArchiveLoading(true)
      setArchiveError(null)

      try {
        const response = await eventsApi.listArchivedEvents(archiveReferenceDate, 1, PAGE_SIZE)

        if (!ignore) {
          setArchivedEvents(response.items)
          setArchivePagination(response.pagination)
        }
      } catch (error) {
        if (!ignore) {
          setArchiveError(getErrorMessage(error))
          setArchivedEvents([])
          setArchivePagination(null)
        }
      } finally {
        if (!ignore) {
          setIsArchiveLoading(false)
        }
      }
    }

    void loadArchivedEvents()

    return () => {
      ignore = true
    }
  }, [archiveReferenceDate])

  async function handleArchiveShowMore() {
    if (!archivePagination?.has_next || isArchiveLoadingMore) {
      return
    }

    setIsArchiveLoadingMore(true)
    setArchiveError(null)

    try {
      const response = await eventsApi.listArchivedEvents(
        archiveReferenceDate,
        archivePagination.page + 1,
        PAGE_SIZE,
      )
      setArchivedEvents((current) => mergeEvents(current, response.items))
      setArchivePagination(response.pagination)
    } catch (error) {
      setArchiveError(getErrorMessage(error))
    } finally {
      setIsArchiveLoadingMore(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>{t('gatherings.hero.title')}</h1>
          <p className={styles.heroDescription}>{t('gatherings.hero.description')}</p>

          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#upcoming-events">
              {t('gatherings.hero.primaryAction')}
              <span className={styles.arrowIcon} aria-hidden="true" />
            </a>
            <Link className={styles.secondaryAction} to="/events/calendar">
              <span className={styles.calendarIcon} aria-hidden="true" />
              {t('gatherings.hero.calendarAction')}
            </Link>
            <a className={styles.secondaryAction} href="#event-archive">
              {t('gatherings.hero.secondaryAction')}
            </a>
          </div>
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.mediaChrome}>
            <div className={styles.mediaBar}>
              <span>CSAA Events 4:00</span>
              <span>HD</span>
            </div>
            <img
              src={WEBSITE_ASSET_URLS.gatheringsHeroStage}
              alt={t('gatherings.hero.imageAlt')}
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <section id="upcoming-events" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>{t('gatherings.upcoming.eyebrow')}</p>
            <h2>{t('gatherings.upcoming.title')}</h2>
          </div>
        </div>

        {upcomingError ? <p className={styles.errorText}>{upcomingError}</p> : null}

        {isUpcomingLoading ? (
          <div className={styles.cardGrid}>
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className={styles.skeletonCard} aria-hidden="true" />
            ))}
          </div>
        ) : upcomingEvents.length ? (
          <>
            <div className={styles.cardGrid}>
              {visibleUpcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  locale={locale}
                  variant="upcoming"
                />
              ))}
            </div>

            {hasMoreUpcomingEvents ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreButton}
                  onClick={() =>
                    setUpcomingVisibleCount((current) => current + PAGE_SIZE)
                  }
                >
                  {t('common.showMore')}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={t('gatherings.upcoming.emptyTitle')}
          />
        )}
      </section>

      <section id="event-archive" className={styles.section}>
        <div className={styles.archiveHeader}>
          <div>
            <p className={styles.sectionEyebrow}>{t('gatherings.archive.eyebrow')}</p>
            <h2>{t('gatherings.archive.title')}</h2>
          </div>
        </div>

        {archiveError ? <p className={styles.errorText}>{archiveError}</p> : null}

        {isArchiveLoading ? (
          <div className={styles.cardGrid}>
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className={styles.skeletonCard} aria-hidden="true" />
            ))}
          </div>
        ) : archivedEvents.length ? (
          <>
            <div className={styles.cardGrid}>
              {archivedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  locale={locale}
                  variant="archive"
                />
              ))}
            </div>

            {hasMoreArchivedEvents ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreButton}
                  disabled={isArchiveLoadingMore}
                  onClick={() => void handleArchiveShowMore()}
                >
                  {isArchiveLoadingMore ? t('common.loading') : t('common.showMore')}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={t('gatherings.archive.emptyTitle')}
          />
        )}
      </section>
    </div>
  )
}

type EventCardProps = {
  event: EventDetailResponse
  locale: string
  variant: 'upcoming' | 'archive'
}

function EventCard({ event, locale, variant }: EventCardProps) {
  const { t } = useTranslation()
  const registrationState = getRegistrationState(event, locale, t)
  const venueLabel = buildVenueLabel(event.address, event.location_mode, t)
  const imageUrl =
    event.display_image && isImageMedia(event.display_image)
      ? resolveEventMediaUrl(event.display_image)
      : null

  return (
    <article className={styles.card}>
      <div className={styles.cardMediaWrap}>
        <div className={styles.dateBadge}>
          <span>{formatEventBadgeMonth(event.start_at, event.event_type, locale)}</span>
          <strong>{formatEventBadgeDay(event.start_at, event.event_type, locale)}</strong>
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt={event.title} className={styles.cardMedia} />
        ) : (
          <div className={styles.cardPlaceholder}>
            <span>{event.categories[0] || t('gatherings.card.placeholderTag')}</span>
            <h3>{event.title}</h3>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle} title={event.title}>
            {event.title}
          </h3>
          <span
            className={`${styles.statusChip} ${
              registrationState.tone === 'success'
                ? styles.statusSuccess
                : registrationState.tone === 'warning'
                  ? styles.statusWarning
                  : styles.statusNeutral
            }`}
          >
            {registrationState.label}
          </span>
        </div>

        <div className={styles.cardMetaStack}>
          <p className={styles.cardMeta}>
            {formatEventDateRange(event.start_at, event.end_at, event.event_type, locale)}
          </p>
          <p className={styles.cardMeta}>
            {formatEventTimeRange(event.start_at, event.end_at, event.event_type, locale, t)}
          </p>
          <p className={styles.cardMeta}>{venueLabel}</p>
        </div>

        <Link to={`/events/${event.id}`} className={styles.cardLink}>
          {variant === 'upcoming'
            ? t('gatherings.card.viewDetails')
            : t('gatherings.card.viewArchive')}
        </Link>
      </div>
    </article>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

function mergeEvents(current: EventDetailResponse[], next: EventDetailResponse[]) {
  const seen = new Set(current.map((item) => item.id))
  return [...current, ...next.filter((item) => !seen.has(item.id))]
}

function getCurrentApiDate() {
  return toApiDate(new Date())
}

function getYesterdayApiDate() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return toApiDate(date)
}

function toApiDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load events.'
}
