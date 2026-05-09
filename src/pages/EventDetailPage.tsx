import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../api/apiClient'
import { eventsApi, type EventDetailResponse } from '../api/eventsApi'
import {
  buildAddressLines,
  buildVenueLabel,
  formatEventDateRange,
  formatEventDateTime,
  formatEventTimeRange,
  formatOccurrenceSummary,
  getRegistrationState,
} from '../lib/eventsDate'
import {
  getMediaExtension,
  getMediaName,
  isImageMedia,
  isPdfMedia,
  resolveEventMediaApiPath,
  resolveEventMediaUrl,
} from '../lib/eventMedia'
import styles from './EventDetailPage.module.css'

export function EventDetailPage() {
  const { eventId } = useParams()
  const { i18n, t } = useTranslation()
  const [event, setEvent] = useState<EventDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agendaIndex, setAgendaIndex] = useState(0)
  const [isAgendaDownloading, setIsAgendaDownloading] = useState(false)
  const [agendaDownloadError, setAgendaDownloadError] = useState<string | null>(null)
  const [activeAttachmentIndex, setActiveAttachmentIndex] = useState<number | null>(null)

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
  const compactAddressLines = addressLines.filter(
    (line, index) => index !== 0 || line !== event.address?.name,
  )
  const mapQuery =
    event.location_mode === 'address' && addressLines.length
      ? addressLines.join(', ')
      : ''
  const encodedMapQuery = mapQuery ? encodeURIComponent(mapQuery) : ''
  const displayImageUrl =
    event.display_image && isImageMedia(event.display_image)
      ? resolveEventMediaUrl(event.display_image)
      : null
  const attachmentCount = event.attachments.length
  const activeAttachment =
    activeAttachmentIndex === null ? null : event.attachments[activeAttachmentIndex] ?? null
  const normalizedAgendaIndex = attachmentCount ? Math.min(agendaIndex, attachmentCount - 1) : 0
  const agendaAttachment = event.attachments[normalizedAgendaIndex] ?? null

  function openAttachment(index: number) {
    setActiveAttachmentIndex(index)
  }

  function closeAttachment() {
    setActiveAttachmentIndex(null)
  }

  function moveAttachment(direction: -1 | 1) {
    setActiveAttachmentIndex((current) => {
      if (current === null || !attachmentCount) {
        return current
      }

      return (current + direction + attachmentCount) % attachmentCount
    })
  }

  function moveAgenda(direction: -1 | 1) {
    setAgendaIndex((current) => {
      if (!attachmentCount) {
        return 0
      }

      const safeCurrent = Math.min(current, attachmentCount - 1)
      return (safeCurrent + direction + attachmentCount) % attachmentCount
    })
  }

  async function downloadAgendaAttachment() {
    const attachment = agendaAttachment

    if (!attachment || isAgendaDownloading) {
      return
    }

    setIsAgendaDownloading(true)
    setAgendaDownloadError(null)

    try {
      const response = await apiClient.get<Blob>(resolveEventMediaApiPath(attachment), {
        responseType: 'blob',
        skipAuth: true,
        skipErrorToast: true,
      })
      const downloadUrl = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = getMediaName(attachment)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    } catch {
      setAgendaDownloadError(t('eventDetail.agendaDownloadError'))
    } finally {
      setIsAgendaDownloading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/gatherings" className={styles.backLink}>
        {t('eventDetail.backToGatherings')}
      </Link>

      <section className={styles.hero}>
        {displayImageUrl ? (
          <div className={styles.heroMedia}>
            <img src={displayImageUrl} alt={event.title} className={styles.heroImage} />
            <div className={styles.heroOverlay}>
              <p className={styles.heroEyebrow}>{venueLabel}</p>
              <h1 className={styles.heroTitle}>{event.title}</h1>
              <p className={styles.heroDescription}>
                {event.teaser.trim() || t('eventDetail.defaultSummary')}
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.heroFallback}>
            <p className={styles.heroEyebrow}>{venueLabel}</p>
            <h1 className={styles.heroTitle}>{event.title}</h1>
            <p className={styles.heroDescription}>
              {event.teaser.trim() || t('eventDetail.defaultSummary')}
            </p>
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

          {agendaAttachment ? (
            <section className={styles.agendaSection}>
              <div className={styles.agendaHeader}>
                <div className={styles.agendaTitle}>
                  <span className={styles.agendaIcon} aria-hidden="true" />
                  <h2>{t('eventDetail.documentsEyebrow')}</h2>
                </div>

                {event.attachments.length > 1 ? (
                  <div className={styles.agendaControls}>
                    <button
                      type="button"
                      className={styles.agendaControl}
                      onClick={() => moveAgenda(-1)}
                    >
                      {t('common.previous')}
                    </button>
                    <span>
                      {normalizedAgendaIndex + 1} / {event.attachments.length}
                    </span>
                    <button
                      type="button"
                      className={styles.agendaControl}
                      onClick={() => moveAgenda(1)}
                    >
                      {t('common.next')}
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className={[
                  styles.agendaSlide,
                  !isImageMedia(agendaAttachment) ? styles.agendaDocumentSlide : '',
                  isPdfMedia(agendaAttachment) ? styles.agendaPdfSlide : '',
                ].filter(Boolean).join(' ')}
                onClick={() => openAttachment(normalizedAgendaIndex)}
                aria-label={getMediaName(agendaAttachment)}
              >
                {isImageMedia(agendaAttachment) ? (
                  <img
                    src={resolveEventMediaUrl(agendaAttachment)}
                    alt={getMediaName(agendaAttachment)}
                  />
                ) : (
                  <span className={styles.agendaDocumentPreview} aria-hidden="true" />
                )}
                {isImageMedia(agendaAttachment) ? (
                  <span className={styles.agendaShade} />
                ) : null}
                <span className={styles.agendaFileBadge}>
                  {getMediaExtension(agendaAttachment)}
                </span>
              </button>

              <div className={styles.agendaDownloadCard}>
                <div>
                  <h3>{t('eventDetail.agendaDownloadTitle')}</h3>
                  <p>{t('eventDetail.agendaDownloadDescription')}</p>
                </div>
                <button
                  type="button"
                  className={styles.agendaDownloadAction}
                  onClick={downloadAgendaAttachment}
                  disabled={isAgendaDownloading}
                >
                  <span aria-hidden="true" />
                  {isAgendaDownloading
                    ? t('common.loading')
                    : isPdfMedia(agendaAttachment)
                      ? t('eventDetail.agendaDownloadPdfAction')
                      : t('eventDetail.agendaDownloadFileAction')}
                </button>
              </div>
              {agendaDownloadError ? (
                <p className={styles.agendaDownloadError}>{agendaDownloadError}</p>
              ) : null}
            </section>
          ) : null}
        </section>

        <aside className={styles.sideColumn}>
          <section className={styles.compactInfoCard}>
            <div className={styles.compactInfoAccent} aria-hidden="true" />

            <section className={styles.compactInfoSection}>
              <DetailIcon name="calendar" className={styles.compactInfoIcon} />
              <div className={styles.compactInfoBody}>
                <h2>{t('eventDetail.info.dateTime')}</h2>
                <strong>
                  {formatEventDateRange(
                    event.start_at,
                    event.end_at,
                    event.event_type,
                    locale,
                  )}
                </strong>
                <p>
                  {formatEventTimeRange(
                    event.start_at,
                    event.end_at,
                    event.event_type,
                    locale,
                    t,
                  )}
                </p>
              </div>
            </section>

            <section className={styles.compactInfoSection}>
              <DetailIcon name="tag" className={styles.compactInfoIcon} />
              <div className={styles.compactInfoBody}>
                <h2>{t('eventDetail.info.categories')}</h2>
                <strong>{event.categories.join(', ') || t('common.notAvailable')}</strong>
              </div>
            </section>

            <section className={styles.compactInfoSection}>
              <DetailIcon name="pin" className={styles.compactInfoIcon} />
              <div className={styles.compactInfoBody}>
                <h2>{t('eventDetail.info.location')}</h2>
                <strong>{venueLabel}</strong>
                {compactAddressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}

                {encodedMapQuery ? (
                  <div className={styles.compactMapBlock}>
                    <iframe
                      title={t('eventDetail.mapTitle')}
                      src={`https://www.google.com/maps?q=${encodedMapQuery}&output=embed`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.compactMapLink}
                    >
                      {t('eventDetail.openMap')}
                    </a>
                  </div>
                ) : null}
              </div>
            </section>

            {event.repeat_enabled && event.occurrences.length ? (
              <section className={styles.compactInfoSection}>
                <DetailIcon name="clock" className={styles.compactInfoIcon} />
                <div className={styles.compactInfoBody}>
                  <h2>{t('eventDetail.occurrencesTitle')}</h2>
                  <ul className={styles.compactOccurrenceList}>
                    {event.occurrences.map((occurrence) => (
                      <li key={occurrence.id}>
                        {formatOccurrenceSummary(occurrence, event.event_type, locale, t)}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            <section className={styles.compactInfoSection}>
              <DetailIcon name="clipboard" className={styles.compactInfoIcon} />
              <div className={styles.compactInfoBody}>
                <h2>{t('eventDetail.registrationTitle')}</h2>
                <strong>{registrationState.label}</strong>
                <p>{registrationState.detail}</p>
                {event.registration_enabled ? (
                  <>
                    <p>
                      {t('eventDetail.registrationStarts')}
                      {formatEventDateTime(
                        event.registration_start_at,
                        'single_day_partial',
                        locale,
                        t,
                      )}
                    </p>
                    <p>
                      {t('eventDetail.registrationEnds')}
                      {formatEventDateTime(
                        event.registration_end_at,
                        'single_day_partial',
                        locale,
                        t,
                      )}
                    </p>
                  </>
                ) : null}
              </div>
            </section>

            {(event.contact_name || event.contact_email || event.contact_phone) && (
              <section className={styles.compactInfoSection}>
                <DetailIcon name="user" className={styles.compactInfoIcon} />
                <div className={styles.compactInfoBody}>
                  <h2>{t('eventDetail.contactTitle')}</h2>
                  {event.contact_name ? <strong>{event.contact_name}</strong> : null}
                  {event.contact_email ? (
                    <a href={`mailto:${event.contact_email}`} className={styles.inlineLink}>
                      {event.contact_email}
                    </a>
                  ) : null}
                  {event.contact_phone ? (
                    <a href={`tel:${event.contact_phone}`} className={styles.inlineLink}>
                      {event.contact_phone}
                    </a>
                  ) : null}
                </div>
              </section>
            )}

            {registrationState.isOpen ? (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noreferrer"
                className={styles.compactRegisterAction}
              >
                {t('eventDetail.registerNow')}
                <DetailIcon name="arrow" className={styles.registerArrowIcon} />
              </a>
            ) : (
              <div
                className={`${styles.compactRegistrationStatus} ${
                  registrationState.tone === 'warning'
                    ? styles.compactRegistrationWarning
                    : styles.compactRegistrationNeutral
                }`}
              >
                {registrationState.label}
              </div>
            )}
          </section>
        </aside>
      </div>

      {activeAttachment ? (
        <div className={styles.viewerOverlay} role="dialog" aria-modal="true">
          <div className={styles.viewerPanel}>
            <div className={styles.viewerHeader}>
              <strong>{getMediaName(activeAttachment)}</strong>
              <button type="button" onClick={closeAttachment}>
                {t('common.close')}
              </button>
            </div>

            <div className={styles.viewerStage}>
              {isImageMedia(activeAttachment) ? (
                <img
                  src={resolveEventMediaUrl(activeAttachment)}
                  alt={getMediaName(activeAttachment)}
                />
              ) : (
                <iframe
                  title={getMediaName(activeAttachment)}
                  src={resolveEventMediaUrl(activeAttachment)}
                />
              )}
            </div>

            {event.attachments.length > 1 ? (
              <div className={styles.viewerControls}>
                <button type="button" onClick={() => moveAttachment(-1)}>
                  {t('common.previous')}
                </button>
                <span>
                  {(activeAttachmentIndex ?? 0) + 1} / {event.attachments.length}
                </span>
                <button type="button" onClick={() => moveAttachment(1)}>
                  {t('common.next')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

type DetailIconName =
  | 'calendar'
  | 'clock'
  | 'tag'
  | 'pin'
  | 'clipboard'
  | 'user'
  | 'mail'
  | 'phone'
  | 'map'
  | 'arrow'

function DetailIcon({
  name,
  className,
}: {
  name: DetailIconName
  className?: string
}) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'calendar' ? (
        <>
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
          <path d="M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </>
      ) : null}
      {name === 'clock' ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === 'tag' ? (
        <>
          <path d="M20 13 11 22 2 13V4h9l9 9Z" />
          <path d="M7.5 8h.01" />
        </>
      ) : null}
      {name === 'pin' ? (
        <>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </>
      ) : null}
      {name === 'clipboard' ? (
        <>
          <path d="M9 4h6" />
          <path d="M9 4a3 3 0 0 0 6 0" />
          <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
        </>
      ) : null}
      {name === 'user' ? (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      ) : null}
      {name === 'mail' ? (
        <>
          <path d="M4 5h16v14H4z" />
          <path d="m4 7 8 6 8-6" />
        </>
      ) : null}
      {name === 'phone' ? (
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
      ) : null}
      {name === 'map' ? (
        <>
          <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
          <path d="M9 3v15" />
          <path d="M15 6v15" />
        </>
      ) : null}
      {name === 'arrow' ? (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      ) : null}
    </svg>
  )
}
