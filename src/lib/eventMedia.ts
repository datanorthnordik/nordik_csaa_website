import type { EventMedia } from '../api/eventsApi'
import { API_BASE_URL, API_ROUTES } from '../constants/api'

function normalizeApiPath(value?: string) {
  if (!value) {
    return null
  }

  if (value.startsWith('/api/')) {
    return value
  }

  if (!/^https?:\/\//i.test(value)) {
    return null
  }

  try {
    const parsedUrl = new URL(value)
    return parsedUrl.pathname.startsWith('/api/')
      ? `${parsedUrl.pathname}${parsedUrl.search}`
      : null
  } catch {
    return null
  }
}

export function resolveEventMediaApiPath(
  media: Pick<EventMedia, 'id' | 'event_id'> &
    Partial<Pick<EventMedia, 'fetch_url' | 'file_url'>>,
) {
  return (
    normalizeApiPath(media.fetch_url) ??
    normalizeApiPath(media.file_url) ??
    API_ROUTES.eventMediaById(media.event_id, media.id)
  )
}

export function resolveEventMediaUrl(media: EventMedia) {
  const path = resolveEventMediaApiPath(media)

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${API_BASE_URL}${path}`
}

export function isImageMedia(media?: Pick<EventMedia, 'mime_type'> | null) {
  return Boolean(media?.mime_type?.toLowerCase().startsWith('image/'))
}

export function isPdfMedia(media?: Pick<EventMedia, 'mime_type'> | null) {
  return media?.mime_type?.toLowerCase() === 'application/pdf'
}

export function getMediaExtension(media: Pick<EventMedia, 'display_name' | 'mime_type'>) {
  const displayName = media.display_name.trim()
  const extension = displayName.includes('.')
    ? displayName.split('.').pop()
    : media.mime_type.split('/').pop()

  return extension?.toUpperCase() ?? 'FILE'
}

export function getMediaName(media: Pick<EventMedia, 'display_name'>) {
  return media.display_name.trim() || 'Event media'
}
