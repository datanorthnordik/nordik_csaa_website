import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { eventsApi, type EventDetailResponse } from '../api/eventsApi'
import { EventMediaViewer } from '../components/EventMediaViewer'
import {
  buildAddressLines,
  buildVenueLabel,
  formatEventDateRange,
  formatEventDateTime,
  formatEventTimeRange,
  formatOccurrenceSummary,
  getRegistrationState,
} from '../lib/eventsDate'
import { isImageMedia, resolveEventMediaUrl } from '../lib/eventMedia'
import styles from './EventDetailPage.module.css'

export function EventDetailPage() {
  const { eventId } = useParams()
  const { i18n, t } = useTranslation()
  const [event, setEvent] = useState<EventDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const locale = i18n.resolvedLanguage ?? i18n.language
  const parsedEventId = Number.parseInt(eventId ?? '', 10)
  const invalidEventId = !Number.isFinite(parsedEventId)

  useEffect(() => {
    if (invalidEventId) {
      return
    }

    let ignore = false

    async function loadEvent() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await eventsApi.getEvent(parsedEventId)
        if (!ignore) {
          setEvent(response)
        }
      } catch (loadError) {
        if (!ignore) {
          setEvent(null)
          setError(
            loadError instanceof Error
              ? loadError.message
              : t('eventDetail.loadError'),
          )
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadEvent()

    return () => {
      ignore = true
    }
  }, [invalidEventId, parsedEventId, t])

  if (invalidEventId) {
    return (
      <div className={styles.errorPanel}>
        <p className={styles.loadingEyebrow}>{t('eventDetail.errorEyebrow')}</p>
        <h1>{t('eventDetail.invalidId')}</h1>
        <Link to="/gatherings" className={styles.primaryAction}>
          {t('eventDetail.backToGatherings')}
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.loadingPanel}>
        <p className={styles.loadingEyebrow}>{t('common.loading')}</p>
        <h1>{t('eventDetail.loadingTitle')}</h1>
      </div>
    )
  }

  if (!event || error) {
    return (
      <div className={styles.errorPanel}>
        <p className={styles.loadingEyebrow}>{t('eventDetail.errorEyebrow')}</p>
        <h1>{error ?? t('eventDetail.loadError')}</h1>
        <Link to="/gatherings" className={styles.primaryAction}>
          {t('eventDetail.backToGatherings')}
        </Link>
      </div>
    )
  }

  const registrationState = getRegistrationState(event, locale, t)
  const venueLabel = buildVenueLabel(event.address, event.location_mode, t)
  const addressLines = buildAddressLines(event.address)
  const displayImageUrl =
    event.display_image && isImageMedia(event.display_image)
      ? resolveEventMediaUrl(event.display_image)
      : null

  return (
    <div className={styles.page}>
      <Link to="/gatherings" className={styles.backLink}>
        {t('eventDetail.backToGatherings')}
      </Link>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>{venueLabel}</p>
          <h1 className={styles.heroTitle}>{event.title}</h1>
          <p className={styles.heroDescription}>
            {event.teaser.trim() || t('eventDetail.defaultSummary')}
          </p>

          <div className={styles.heroMetaGrid}>
            <InfoCard
              label={t('eventDetail.info.start')}
              value={formatEventDateTime(event.start_at, event.event_type, locale, t)}
            />
            <InfoCard
              label={t('eventDetail.info.end')}
              value={formatEventDateTime(event.end_at, event.event_type, locale, t)}
            />
            <InfoCard label={t('eventDetail.info.time')} value={formatEventTimeRange(
              event.start_at,
              event.end_at,
              event.event_type,
              locale,
              t,
            )} />
            <InfoCard label={t('eventDetail.info.venue')} value={venueLabel} />
          </div>
        </div>

        {displayImageUrl ? (
          <div className={styles.heroMedia}>
            <img src={displayImageUrl} alt={event.title} className={styles.heroImage} />
          </div>
        ) : (
          <div className={styles.heroPlaceholder}>
            <span>{t('eventDetail.placeholderLabel')}</span>
            <h2>{formatEventDateRange(event.start_at, event.end_at, event.event_type, locale)}</h2>
            <p>{venueLabel}</p>
          </div>
        )}
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <p className={styles.sectionEyebrow}>{t('eventDetail.overviewEyebrow')}</p>
            <h2>{t('eventDetail.overviewTitle')}</h2>
          </div>

          {event.description_html.trim() ? (
            <div
              className={styles.richText}
              dangerouslySetInnerHTML={{ __html: event.description_html }}
            />
          ) : (
            <p className={styles.paragraph}>
              {event.teaser.trim() || t('eventDetail.defaultSummary')}
            </p>
          )}
        </section>

        <aside className={styles.sideColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <p className={styles.sectionEyebrow}>{t('eventDetail.scheduleEyebrow')}</p>
              <h2>{t('eventDetail.scheduleTitle')}</h2>
            </div>

            <dl className={styles.definitionList}>
              <div>
                <dt>{t('eventDetail.info.dateRange')}</dt>
                <dd>
                  {formatEventDateRange(
                    event.start_at,
                    event.end_at,
                    event.event_type,
                    locale,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t('eventDetail.info.time')}</dt>
                <dd>
                  {formatEventTimeRange(
                    event.start_at,
                    event.end_at,
                    event.event_type,
                    locale,
                    t,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t('eventDetail.info.categories')}</dt>
                <dd>{event.categories.join(', ') || t('common.notAvailable')}</dd>
              </div>
              <div>
                <dt>{t('eventDetail.info.venue')}</dt>
                <dd>{venueLabel}</dd>
              </div>
            </dl>

            {addressLines.length ? (
              <div className={styles.addressBlock}>
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            {event.repeat_enabled && event.occurrences.length ? (
              <div className={styles.occurrenceSection}>
                <h3>{t('eventDetail.occurrencesTitle')}</h3>
                <ul className={styles.occurrenceList}>
                  {event.occurrences.map((occurrence) => (
                    <li key={occurrence.id}>
                      {formatOccurrenceSummary(occurrence, event.event_type, locale, t)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <p className={styles.sectionEyebrow}>{t('eventDetail.registrationEyebrow')}</p>
              <h2>{t('eventDetail.registrationTitle')}</h2>
            </div>

            <div
              className={`${styles.registrationCard} ${
                registrationState.tone === 'success'
                  ? styles.registrationSuccess
                  : registrationState.tone === 'warning'
                    ? styles.registrationWarning
                    : styles.registrationNeutral
              }`}
            >
              <strong>{registrationState.label}</strong>
              <p>{registrationState.detail}</p>

              {event.registration_enabled ? (
                <div className={styles.registrationMeta}>
                  <span>
                    {t('eventDetail.registrationStarts')}
                    {formatEventDateTime(
                      event.registration_start_at,
                      'single_day_partial',
                      locale,
                      t,
                    )}
                  </span>
                  <span>
                    {t('eventDetail.registrationEnds')}
                    {formatEventDateTime(
                      event.registration_end_at,
                      'single_day_partial',
                      locale,
                      t,
                    )}
                  </span>
                </div>
              ) : null}

              {registrationState.isOpen ? (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.primaryAction}
                >
                  {t('eventDetail.registerNow')}
                </a>
              ) : null}
            </div>
          </section>

          {(event.contact_name || event.contact_email || event.contact_phone) && (
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <p className={styles.sectionEyebrow}>{t('eventDetail.contactEyebrow')}</p>
                <h2>{t('eventDetail.contactTitle')}</h2>
              </div>

              <dl className={styles.definitionList}>
                {event.contact_name ? (
                  <div>
                    <dt>{t('eventDetail.contactName')}</dt>
                    <dd>{event.contact_name}</dd>
                  </div>
                ) : null}
                {event.contact_email ? (
                  <div>
                    <dt>{t('eventDetail.contactEmail')}</dt>
                    <dd>
                      <a href={`mailto:${event.contact_email}`} className={styles.inlineLink}>
                        {event.contact_email}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {event.contact_phone ? (
                  <div>
                    <dt>{t('eventDetail.contactPhone')}</dt>
                    <dd>{event.contact_phone}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          )}
        </aside>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <p className={styles.sectionEyebrow}>{t('eventDetail.mediaEyebrow')}</p>
          <h2>{t('eventDetail.mediaTitle')}</h2>
          <p className={styles.panelDescription}>{t('eventDetail.mediaDescription')}</p>
        </div>

        {event.attachments.length ? (
          <EventMediaViewer items={event.attachments} />
        ) : (
          <div className={styles.emptyState}>
            <h3>{t('eventDetail.mediaEmptyTitle')}</h3>
            <p>{t('eventDetail.mediaEmptyDescription')}</p>
          </div>
        )}
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
