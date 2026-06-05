import type { EventAddress, EventDetailResponse } from '../api/eventsApi'
import { isImageMedia, resolveEventMediaUrl } from './eventMedia'
import { buildAbsoluteUrl, SITE_NAME } from './usePageSeo'

type StructuredDataObject = Record<string, unknown>

type EventSchemaOptions = {
  canonicalPath?: string
  description?: string
  image?: string | null
}

type EventListSchemaOptions = {
  title: string
  description: string
  canonicalPath: string
  events: EventDetailResponse[]
}

export function buildEventSchema(
  event: EventDetailResponse,
  options: EventSchemaOptions = {},
): StructuredDataObject | undefined {
  const eventSchema = buildEventSchemaObject(event, options)
  if (!eventSchema) {
    return undefined
  }

  return {
    '@context': 'https://schema.org',
    ...eventSchema,
  }
}

export function buildEventListSchema({
  title,
  description,
  canonicalPath,
  events,
}: EventListSchemaOptions): StructuredDataObject {
  const visibleEvents = events
    .slice(0, 20)
    .map((event) => {
      const item = buildEventSchemaObject(event)
      if (!item) {
        return null
      }

      return {
        event,
        item,
      }
    })
    .filter(
      (
        item,
      ): item is {
        event: EventDetailResponse
        item: StructuredDataObject
      } => Boolean(item),
    )
    .map(({ event, item }, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: buildAbsoluteUrl(`/events/${event.id}`),
        item,
      }
    })

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: buildAbsoluteUrl(canonicalPath),
    mainEntity: {
      '@type': 'ItemList',
      name: `${title} listing`,
      numberOfItems: visibleEvents.length,
      itemListElement: visibleEvents,
    },
  } satisfies StructuredDataObject
}

function buildEventSchemaObject(
  event: EventDetailResponse,
  options: EventSchemaOptions = {},
): StructuredDataObject | undefined {
  const name = cleanText(event.title)
  const startDate = formatStructuredEventDate(event.start_at, event.event_type)
  const location = buildLocationSchema(event.address, event.location_mode)
  if (!name || !startDate || !location) {
    return undefined
  }

  const url = buildAbsoluteUrl(options.canonicalPath ?? `/events/${event.id}`)
  const image = options.image ?? getEventImageUrl(event)
  const description =
    cleanText(options.description) ||
    cleanText(event.teaser) ||
    cleanText(event.description_html)

  return compactStructuredData({
    '@type': 'Event',
    name,
    description,
    url,
    mainEntityOfPage: url,
    startDate,
    endDate: formatStructuredEventDate(event.end_at, event.event_type) || undefined,
    eventStatus: getEventStatus(event),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: image || undefined,
    keywords: event.categories.length ? event.categories.join(', ') : undefined,
    organizer: compactStructuredData({
      '@type': 'Organization',
      name: SITE_NAME,
      url: buildAbsoluteUrl('/'),
    }),
    location,
    offers: buildOfferSchema(event),
  })
}

function buildLocationSchema(
  address: EventAddress | null | undefined,
  locationMode: EventDetailResponse['location_mode'],
): StructuredDataObject | undefined {
  if (locationMode !== 'address' || !address) {
    return undefined
  }

  const locationName = cleanText(address.name)
  const streetAddress = [address.address_line_1, address.address_line_2]
    .filter(Boolean)
    .join(', ')
  const addressLocality = cleanText(address.city)
  const addressRegion = cleanText(address.province_state)
  const hasRecognizableAddress = Boolean(streetAddress || addressLocality || addressRegion)
  const postalAddress = compactStructuredData({
    '@type': 'PostalAddress',
    streetAddress: streetAddress || undefined,
    addressLocality: addressLocality || undefined,
    addressRegion: addressRegion || undefined,
    postalCode: cleanText(address.postal_code) || undefined,
    addressCountry: cleanText(address.country) || undefined,
  })

  if (!locationName || !hasRecognizableAddress) {
    return undefined
  }

  return compactStructuredData({
    '@type': 'Place',
    name: locationName,
    address: postalAddress,
  })
}

function buildOfferSchema(
  event: Pick<
    EventDetailResponse,
    | 'registration_enabled'
    | 'registration_url'
    | 'registration_start_at'
    | 'registration_end_at'
    | 'start_at'
  >,
): StructuredDataObject | undefined {
  const registrationUrl = cleanText(event.registration_url)
  if (!event.registration_enabled || !registrationUrl) {
    return undefined
  }

  const now = new Date()
  const registrationStart = parseStructuredDateTime(event.registration_start_at)
  const registrationEnd = parseStructuredDateTime(event.registration_end_at)
  const eventStart = parseStructuredDateTime(event.start_at)
  const registrationIsOpen =
    (!registrationStart || registrationStart <= now) &&
    (!registrationEnd || registrationEnd >= now) &&
    (!eventStart || eventStart >= now)

  return compactStructuredData({
    '@type': 'Offer',
    url: buildAbsoluteUrl(registrationUrl),
    availability: registrationIsOpen ? 'https://schema.org/InStock' : undefined,
    validFrom: formatStructuredDateTime(event.registration_start_at) || undefined,
  })
}

function getEventStatus(event: EventDetailResponse) {
  const comparisonDate = new Date(event.end_at || event.start_at)
  if (Number.isNaN(comparisonDate.getTime())) {
    return undefined
  }

  return comparisonDate < new Date()
    ? 'https://schema.org/EventCompleted'
    : 'https://schema.org/EventScheduled'
}

function getEventImageUrl(event: EventDetailResponse) {
  return event.display_image && isImageMedia(event.display_image)
    ? resolveEventMediaUrl(event.display_image)
    : null
}

function formatStructuredEventDate(
  value: string | null | undefined,
  eventType: EventDetailResponse['event_type'],
) {
  const normalizedValue = cleanText(value)
  if (!normalizedValue) {
    return null
  }

  const matchedDate = normalizedValue.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)
  if (isAllDayEventType(eventType)) {
    return matchedDate?.[1] ?? null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue
  }

  return parseStructuredDateTime(normalizedValue) ? normalizedValue : null
}

function formatStructuredDateTime(value: string | null | undefined) {
  const normalizedValue = cleanText(value)
  return parseStructuredDateTime(normalizedValue) ? normalizedValue : null
}

function parseStructuredDateTime(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function isAllDayEventType(eventType: EventDetailResponse['event_type']) {
  return eventType === 'single_day_all_day' || eventType === 'multi_day_all_day'
}

function cleanText(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactStructuredData(value: StructuredDataObject) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null || entry === '') {
        return false
      }

      if (Array.isArray(entry)) {
        return entry.length > 0
      }

      if (typeof entry === 'object') {
        return Object.keys(entry as StructuredDataObject).length > 0
      }

      return true
    }),
  )
}
