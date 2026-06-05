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
) {
  return {
    '@context': 'https://schema.org',
    ...buildEventSchemaObject(event, options),
  }
}

export function buildEventListSchema({
  title,
  description,
  canonicalPath,
  events,
}: EventListSchemaOptions) {
  const visibleEvents = events.slice(0, 20)

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
      itemListElement: visibleEvents.map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: buildAbsoluteUrl(`/events/${event.id}`),
        item: buildEventSchemaObject(event),
      })),
    },
  } satisfies StructuredDataObject
}

function buildEventSchemaObject(
  event: EventDetailResponse,
  options: EventSchemaOptions = {},
) {
  const image = options.image ?? getEventImageUrl(event)
  const description =
    cleanText(options.description) ||
    cleanText(event.teaser) ||
    cleanText(event.description_html)

  return compactStructuredData({
    '@type': 'Event',
    name: cleanText(event.title) || `Event ${event.id}`,
    description,
    url: buildAbsoluteUrl(options.canonicalPath ?? `/events/${event.id}`),
    startDate: event.start_at,
    endDate: event.end_at || undefined,
    eventStatus: getEventStatus(event),
    eventAttendanceMode:
      event.location_mode === 'address'
        ? 'https://schema.org/OfflineEventAttendanceMode'
        : undefined,
    image: image || undefined,
    keywords: event.categories.length ? event.categories.join(', ') : undefined,
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    location: buildLocationSchema(event.address, event.location_mode),
  })
}

function buildLocationSchema(
  address: EventAddress | null | undefined,
  locationMode: EventDetailResponse['location_mode'],
) {
  if (locationMode !== 'address' || !address) {
    return undefined
  }

  const streetAddress = [address.address_line_1, address.address_line_2]
    .filter(Boolean)
    .join(', ')

  return compactStructuredData({
    '@type': 'Place',
    name: cleanText(address.name) || undefined,
    address: compactStructuredData({
      '@type': 'PostalAddress',
      streetAddress: streetAddress || undefined,
      addressLocality: cleanText(address.city) || undefined,
      addressRegion: cleanText(address.province_state) || undefined,
      postalCode: cleanText(address.postal_code) || undefined,
      addressCountry: cleanText(address.country) || undefined,
    }),
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
