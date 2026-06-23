import { API_ROUTES, buildApiUrl } from '../constants/api'
import type {
  PressDetailResponse,
  PressMediaResponse,
} from '../api/pressApi'

export type PressPreviewKind = 'image' | 'placeholder'

export type PressResolvedPreview = {
  previewKind: PressPreviewKind
  previewUrl: string | null
  fileTypeLabel: string
  excerpt: string
}

export type PressDownloadItem = {
  id: number
  title: string
  downloadUrl: string
  downloadFileName: string
  badgeLabel: string
  mimeType: string
}

export function resolvePressMediaUrl(
  entryId: number,
  media: Pick<PressMediaResponse, 'id' | 'file_url'>,
) {
  const trimmed = normalizeString(media.file_url).trim()

  if (trimmed && trimmed.startsWith('/api/')) {
    return buildApiUrl(trimmed)
  }

  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed && !/^gs:\/\//i.test(trimmed)) {
    return trimmed
  }

  return buildApiUrl(API_ROUTES.pressMediaById(entryId, media.id))
}

export function resolvePressCoverUrl(
  entry: Pick<PressDetailResponse, 'id' | 'cover_image_url'>,
) {
  return normalizeString(entry.cover_image_url).trim()
    ? buildApiUrl(API_ROUTES.pressCoverById(entry.id))
    : null
}

export function isImagePressMedia(
  media?: Pick<PressMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return false
  }

  const mimeType = normalizeString(media.mime_type).trim().toLowerCase()
  const extension = getLowercaseFileExtension(media.file_name)

  return mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)
}

export function canPreviewPressMedia(
  media?: Pick<PressMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return false
  }

  const mimeType = normalizeString(media.mime_type).trim().toLowerCase()
  const extension = getLowercaseFileExtension(media.file_name)

  return (
    mimeType.includes('pdf') ||
    mimeType.startsWith('image/') ||
    mimeType.includes('html') ||
    ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'html', 'htm'].includes(extension)
  )
}

export function isPdfPressMedia(
  media?: Pick<PressMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return false
  }

  const mimeType = normalizeString(media.mime_type).trim().toLowerCase()
  const extension = getLowercaseFileExtension(media.file_name)

  return mimeType === 'application/pdf' || extension === 'pdf'
}

export function getPressMediaTypeLabel(
  media?: Pick<PressMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return 'PRESS'
  }

  const extension = getUppercaseFileExtension(media.file_name)
  if (extension) {
    return extension.length > 6 ? extension.slice(0, 6) : extension
  }

  const mimeType = normalizeString(media.mime_type).trim().toLowerCase()
  if (mimeType.includes('pdf')) {
    return 'PDF'
  }
  if (mimeType.includes('html')) {
    return 'HTML'
  }
  if (mimeType.startsWith('image/')) {
    return 'IMAGE'
  }

  return 'PRESS'
}

export function extractPressExcerpt(contentHtml: string | null | undefined, maxLength = 220) {
  const text = htmlToText(contentHtml).replace(/\s+/g, ' ').trim()
  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

function getSortedPressMedia(entry: Pick<PressDetailResponse, 'media'>) {
  const mediaList = Array.isArray(entry.media) ? entry.media : []

  return [...mediaList].sort(
    (left, right) =>
      (left.sort_order ?? 0) - (right.sort_order ?? 0) || (left.id ?? 0) - (right.id ?? 0),
  )
}

export function resolvePressHeroImage(
  entry: Pick<PressDetailResponse, 'id' | 'cover_image_url' | 'media'>,
) {
  const coverUrl = resolvePressCoverUrl(entry)
  if (coverUrl) {
    return coverUrl
  }

  const imageMedia = getSortedPressMedia(entry).find((item) => isImagePressMedia(item)) ?? null
  return imageMedia ? resolvePressMediaUrl(entry.id, imageMedia) : null
}

export function resolvePressPreview(entry: PressDetailResponse): PressResolvedPreview {
  const media = getSortedPressMedia(entry)
  const heroImageUrl = resolvePressHeroImage(entry)
  const previewMedia = media.find((item) => !isImagePressMedia(item) && canPreviewPressMedia(item)) ?? null
  const excerpt = extractPressExcerpt(entry.content_html)
  const sourceUrl = normalizeString(entry.source_url).trim()
  const fallbackFileTypeLabel = previewMedia
    ? getPressMediaTypeLabel(previewMedia)
    : sourceUrl
      ? 'LINK'
      : 'PRESS'

  if (heroImageUrl) {
    return {
      previewKind: 'image',
      previewUrl: heroImageUrl,
      fileTypeLabel: fallbackFileTypeLabel === 'PRESS' ? 'IMAGE' : fallbackFileTypeLabel,
      excerpt,
    }
  }

  return {
    previewKind: 'placeholder',
    previewUrl: null,
    fileTypeLabel: fallbackFileTypeLabel,
    excerpt,
  }
}

export function resolvePressDownloads(entry: PressDetailResponse): PressDownloadItem[] {
  return getSortedPressMedia(entry).map((item) => ({
    id: item.id,
    title:
      normalizeString(item.display_name) ||
      normalizeString(item.file_name) ||
      `Attachment ${item.id}`,
    downloadUrl: resolvePressMediaUrl(entry.id, item),
    downloadFileName:
      normalizeString(item.file_name) ||
      normalizeString(item.display_name) ||
      `attachment-${item.id}`,
    badgeLabel: getPressMediaTypeLabel(item),
    mimeType: normalizeString(item.mime_type),
  }))
}

export function getPressYear(releaseDate: string) {
  const normalizedReleaseDate = normalizeString(releaseDate)
  const parsed = new Date(normalizedReleaseDate)
  return Number.isNaN(parsed.getTime())
    ? normalizedReleaseDate.slice(0, 4)
    : String(parsed.getFullYear())
}

function htmlToText(contentHtml: string | null | undefined) {
  const normalizedContent = normalizeString(contentHtml)

  if (!normalizedContent.trim()) {
    return ''
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(normalizedContent, 'text/html')
    return doc.body.textContent ?? ''
  }

  return normalizedContent.replace(/<[^>]+>/g, ' ')
}

function normalizeString(value: string | null | undefined) {
  return typeof value === 'string' ? value : ''
}

function getLowercaseFileExtension(fileName: string | null | undefined) {
  return normalizeString(fileName).split('.').pop()?.trim().toLowerCase() ?? ''
}

function getUppercaseFileExtension(fileName: string | null | undefined) {
  return normalizeString(fileName).split('.').pop()?.trim().toUpperCase() ?? ''
}
