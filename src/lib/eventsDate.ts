import type {
  EventAddress,
  EventDetailResponse,
  EventOccurrence,
  EventType,
} from '../api/eventsApi'

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

export type RegistrationState = {
  tone: 'neutral' | 'success' | 'warning'
  label: string
  detail: string
  isOpen: boolean
}

export function isAllDayEventType(eventType: EventType) {
  return eventType === 'single_day_all_day' || eventType === 'multi_day_all_day'
}

export function parseEventWallClockDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const matchedDateTime = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(?:Z|[+-]\d{2}:\d{2})?)?$/,
  )
  if (!matchedDateTime) {
    return null
  }

  const year = Number(matchedDateTime[1])
  const month = Number(matchedDateTime[2])
  const day = Number(matchedDateTime[3])
  const hours = Number(matchedDateTime[4] ?? 0)
  const minutes = Number(matchedDateTime[5] ?? 0)
  const seconds = Number(matchedDateTime[6] ?? 0)
  const milliseconds = Number((matchedDateTime[7] ?? '').slice(0, 3).padEnd(3, '0'))
  const date = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds),
  )

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hours ||
    date.getUTCMinutes() !== minutes ||
    date.getUTCSeconds() !== seconds
  ) {
    return null
  }

  return date
}

export function formatEventDateRange(
  startAt: string,
  endAt: string | null | undefined,
  _eventType: EventType,
  locale: string,
) {
  const start = parseEventWallClockDate(startAt)
  if (!start) {
    return startAt
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  if (!endAt) {
    return dateFormatter.format(start)
  }

  const end = parseEventWallClockDate(endAt)
  if (!end) {
    return `${dateFormatter.format(start)} - ${endAt}`
  }

  return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`
}

export function formatEventTimeRange(
  startAt: string,
  endAt: string | null | undefined,
  eventType: EventType,
  locale: string,
  t: TranslateFn,
) {
  if (isAllDayEventType(eventType)) {
    return t('common.allDay')
  }

  const start = parseEventWallClockDate(startAt)
  if (!start) {
    return t('common.timeTbd')
  }

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  if (!endAt) {
    return timeFormatter.format(start)
  }

  const end = parseEventWallClockDate(endAt)
  if (!end) {
    return timeFormatter.format(start)
  }

  const sameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate()
  if (sameDay) {
    return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
  }

  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  return `${dateTimeFormatter.format(start)} - ${dateTimeFormatter.format(end)}`
}

export function formatEventDateTime(
  value: string | null | undefined,
  eventType: EventType,
  locale: string,
  t: TranslateFn,
) {
  if (!value) {
    return t('common.notAvailable')
  }

  if (isAllDayEventType(eventType)) {
    const date = parseEventWallClockDate(value)
    if (!date) {
      return value
    }

    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date)
  }

  const date = parseEventWallClockDate(value)
  if (!date) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

export function formatEventBadgeMonth(
  startAt: string,
  _eventType: EventType,
  locale: string,
) {
  const date = parseEventWallClockDate(startAt)
  if (!date) {
    return '--'
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(date)
    .toUpperCase()
}

export function formatEventBadgeDay(
  startAt: string,
  _eventType: EventType,
  locale: string,
) {
  const date = parseEventWallClockDate(startAt)
  if (!date) {
    return '--'
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

export function formatOccurrenceSummary(
  occurrence: Pick<EventOccurrence, 'occurrence_start_at' | 'occurrence_end_at'>,
  eventType: EventType,
  locale: string,
  t: TranslateFn,
) {
  const dateLabel = formatEventDateRange(
    occurrence.occurrence_start_at,
    occurrence.occurrence_end_at,
    eventType,
    locale,
  )
  const timeLabel = formatEventTimeRange(
    occurrence.occurrence_start_at,
    occurrence.occurrence_end_at,
    eventType,
    locale,
    t,
  )

  return `${dateLabel} • ${timeLabel}`
}

export function buildVenueLabel(
  address: EventAddress | null | undefined,
  locationMode: string,
  t: TranslateFn,
) {
  if (locationMode === 'to_be_determined') {
    return t('common.venueToBeAnnounced')
  }

  if (locationMode !== 'address' || !address) {
    return t('common.venueSharedLater')
  }

  const parts = [
    address.name,
    address.city,
    address.province_state,
    address.country,
  ].filter(Boolean)

  return parts.join(', ') || t('common.venueSharedLater')
}

export function buildAddressLines(address: EventAddress | null | undefined) {
  if (!address) {
    return []
  }

  const locality = [
    address.city,
    address.province_state,
    address.postal_code,
  ]
    .filter(Boolean)
    .join(', ')

  return [
    address.name,
    address.address_line_1,
    address.address_line_2,
    locality,
    address.country,
  ].filter(Boolean)
}

export function getRegistrationState(
  event: Pick<
    EventDetailResponse,
    | 'event_type'
    | 'start_at'
    | 'registration_enabled'
    | 'registration_start_at'
    | 'registration_end_at'
    | 'registration_url'
  >,
  locale: string,
  t: TranslateFn,
) {
  if (!event.registration_enabled) {
    return {
      tone: 'neutral',
      label: t('common.noRegistrationRequired'),
      detail: t('common.walkInWelcome'),
      isOpen: false,
    } satisfies RegistrationState
  }

  const now = toWallClockComparisonDate(new Date())
  const registrationStart = parseDate(event.registration_start_at)
  const registrationEnd = parseDate(event.registration_end_at)
  const eventStart = parseDate(event.start_at)

  if ((registrationEnd && registrationEnd < now) || (eventStart && eventStart < now)) {
    return {
      tone: 'warning',
      label: t('common.registrationClosed'),
      detail: t('common.registrationClosedDetail'),
      isOpen: false,
    } satisfies RegistrationState
  }

  if (registrationStart && registrationStart > now) {
    return {
      tone: 'neutral',
      label: t('common.registrationOpensSoon'),
      detail: new Intl.DateTimeFormat(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(registrationStart),
      isOpen: false,
    } satisfies RegistrationState
  }

  if (!event.registration_url.trim()) {
    return {
      tone: 'warning',
      label: t('common.registrationClosed'),
      detail: t('common.registrationUnavailableDetail'),
      isOpen: false,
    } satisfies RegistrationState
  }

  if (registrationEnd) {
    return {
      tone: 'success',
      label: t('common.registrationOpen'),
      detail: t('common.registrationOpenUntil', {
        date: new Intl.DateTimeFormat(locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'UTC',
        }).format(registrationEnd),
      } as Record<string, unknown>),
      isOpen: true,
    } satisfies RegistrationState
  }

  return {
    tone: 'success',
    label: t('common.registrationOpen'),
    detail: t('common.registrationOpenDetail'),
    isOpen: true,
  } satisfies RegistrationState
}

function parseDate(value: string | null | undefined) {
  return parseEventWallClockDate(value)
}

function toWallClockComparisonDate(value: Date) {
  return new Date(
    Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      value.getHours(),
      value.getMinutes(),
      value.getSeconds(),
      value.getMilliseconds(),
    ),
  )
}
