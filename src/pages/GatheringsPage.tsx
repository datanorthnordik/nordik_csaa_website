import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import heroStageImage from '../assets/gatherings-hero-stage.jpg'
import styles from './GatheringsPage.module.css'

export function GatheringsPage() {
  const { i18n, t } = useTranslation()
  const [upcomingEvents, setUpcomingEvents] = useState<EventDetailResponse[]>([])
  const [archivedEvents, setArchivedEvents] = useState<EventDetailResponse[]>([])
  const [archivePagination, setArchivePagination] = useState<EventListPageMeta | null>(null)
  const [archivePage, setArchivePage] = useState(1)
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true)
  const [isArchiveLoading, setIsArchiveLoading] = useState(true)
  const [upcomingError, setUpcomingError] = useState<string | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const locale = i18n.resolvedLanguage ?? i18n.language
  useEffect(() => {
    let ignore = false

    async function loadUpcomingEvents() {
      setIsUpcomingLoading(true)
      setUpcomingError(null)

      try {
        const response = await eventsApi.listUpcomingEvents(getCurrentApiDate())
        if (!ignore) {
          setUpcomingEvents(response.items)
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
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadArchivedEvents() {
      setIsArchiveLoading(true)
      setArchiveError(null)

      try {
        const response = await eventsApi.listArchivedEvents(
          getYesterdayApiDate(),
          archivePage,
          10,
        )

        if (!ignore) {
          setArchivedEvents(response.items)
          setArchivePagination(response.pagination)
        }
      } catch (error) {
        if (!ignore) {
          setArchiveError(getErrorMessage(error))
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
  }, [archivePage])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t('gatherings.hero.eyebrow')}</p>
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
              src={heroStageImage}
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
          <div className={styles.cardGrid}>
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                locale={locale}
                variant="upcoming"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('gatherings.upcoming.emptyTitle')}
            description={t('gatherings.upcoming.emptyDescription')}
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

            {archivePagination && archivePagination.total_pages > 1 ? (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  disabled={!archivePagination.has_prev}
                  onClick={() => setArchivePage((current) => Math.max(current - 1, 1))}
                >
                  {t('common.previous')}
                </button>
                <span className={styles.paginationLabel}>
                  {t('gatherings.archive.pagination', {
                    page: archivePagination.page,
                    total: archivePagination.total_pages,
                  })}
                </span>
                <button
                  type="button"
                  className={styles.paginationButton}
                  disabled={!archivePagination.has_next}
                  onClick={() =>
                    setArchivePage((current) =>
                      Math.min(current + 1, archivePagination.total_pages),
                    )
                  }
                >
                  {t('common.next')}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={t('gatherings.archive.emptyTitle')}
            description={t('gatherings.archive.emptyDescription')}
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
  description: string
}) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
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
