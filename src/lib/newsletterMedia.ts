import type {
  NewsletterDetailResponse,
  NewsletterMediaResponse,
} from '../api/newslettersApi'
import { API_BASE_URL, API_ROUTES } from '../constants/api'

export type NewsletterPreviewKind = 'image' | 'iframe' | 'placeholder'

export type NewsletterResolvedPreview = {
  previewKind: NewsletterPreviewKind
  previewUrl: string | null
  fileTypeLabel: string
  excerpt: string
}

export type NewsletterFlipbookSource =
  | {
      kind: 'pdf'
      url: string
      fileName: string
    }
  | {
      kind: 'images'
      pages: Array<{
        id: number
        title: string
        altText: string
        imageUrl: string
      }>
    }

export type NewsletterDownloadTarget = {
  url: string
  fileName: string
}

export function resolveNewsletterMediaUrl(
  entryId: number,
  media: Pick<NewsletterMediaResponse, 'id' | 'file_url'>,
) {
  const trimmed = media.file_url.trim()

  if (trimmed && trimmed.startsWith('/api/')) {
    return `${API_BASE_URL}${trimmed}`
  }

  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed && !/^gs:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `${API_BASE_URL}${API_ROUTES.newsletterMediaById(entryId, media.id)}`
}

export function isImageNewsletterMedia(
  media?: Pick<NewsletterMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return false
  }

  const mimeType = media.mime_type.trim().toLowerCase()
  const extension = media.file_name.split('.').pop()?.trim().toLowerCase() ?? ''

  return mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)
}

export function canPreviewNewsletterMedia(
  media?: Pick<NewsletterMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return false
  }

  const mimeType = media.mime_type.trim().toLowerCase()
  const extension = media.file_name.split('.').pop()?.trim().toLowerCase() ?? ''

  return (
    mimeType.includes('pdf') ||
    mimeType.startsWith('image/') ||
    mimeType.includes('html') ||
    ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'html', 'htm'].includes(extension)
  )
}

export function isPdfNewsletterMedia(
  media?: Pick<NewsletterMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return false
  }

  const mimeType = media.mime_type.trim().toLowerCase()
  const extension = media.file_name.split('.').pop()?.trim().toLowerCase() ?? ''

  return mimeType === 'application/pdf' || extension === 'pdf'
}

export function getNewsletterMediaTypeLabel(
  media?: Pick<NewsletterMediaResponse, 'mime_type' | 'file_name'> | null,
) {
  if (!media) {
    return 'NEWSLETTER'
  }

  const extension = media.file_name.split('.').pop()?.trim().toUpperCase() ?? ''
  if (extension) {
    return extension.length > 5 ? extension.slice(0, 5) : extension
  }

  const mimeType = media.mime_type.trim().toLowerCase()
  if (mimeType.includes('pdf')) {
    return 'PDF'
  }
  if (mimeType.includes('html')) {
    return 'HTML'
  }
  if (mimeType.startsWith('image/')) {
    return 'IMAGE'
  }

  return 'NEWSLETTER'
}

export function extractNewsletterExcerpt(contentHtml: string, maxLength = 180) {
  const text = htmlToText(contentHtml).replace(/\s+/g, ' ').trim()
  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

function getSortedNewsletterMedia(entry: Pick<NewsletterDetailResponse, 'media'>) {
  const mediaList = Array.isArray(entry.media) ? entry.media : []

  return [...mediaList].sort(
    (left, right) => left.sort_order - right.sort_order || left.id - right.id,
  )
}

export function resolveNewsletterPreview(entry: NewsletterDetailResponse): NewsletterResolvedPreview {
  const media = getSortedNewsletterMedia(entry)
  const displayImage = media.find((item) => isImageNewsletterMedia(item)) ?? null
  const previewMedia =
    media.find((item) => !isImageNewsletterMedia(item) && canPreviewNewsletterMedia(item)) ??
    displayImage ??
    media[0] ??
    null
  const excerpt = extractNewsletterExcerpt(entry.content_html)
  const fileTypeLabel = previewMedia ? getNewsletterMediaTypeLabel(previewMedia) : 'NEWSLETTER'

  if (displayImage) {
    return {
      previewKind: 'image',
      previewUrl: resolveNewsletterMediaUrl(entry.id, displayImage),
      fileTypeLabel,
      excerpt,
    }
  }

  if (previewMedia && canPreviewNewsletterMedia(previewMedia)) {
    return {
      previewKind: 'iframe',
      previewUrl: resolveNewsletterMediaUrl(entry.id, previewMedia),
      fileTypeLabel,
      excerpt,
    }
  }

  return {
    previewKind: 'placeholder',
    previewUrl: null,
    fileTypeLabel,
    excerpt,
  }
}

export function resolveNewsletterFlipbook(entry: NewsletterDetailResponse): NewsletterFlipbookSource | null {
  const media = getSortedNewsletterMedia(entry)
  const pdfMedia = media.find((item) => isPdfNewsletterMedia(item))

  if (pdfMedia) {
    return {
      kind: 'pdf',
      url: resolveNewsletterMediaUrl(entry.id, pdfMedia),
      fileName: pdfMedia.file_name || pdfMedia.display_name || `${entry.title}.pdf`,
    }
  }

  const imagePages = media.filter((item) => isImageNewsletterMedia(item))
  if (!imagePages.length) {
    return null
  }

  return {
    kind: 'images',
    pages: imagePages.map((item, index) => ({
      id: item.id,
      title: item.display_name || item.file_name || `${entry.title} ${index + 1}`,
      altText: item.display_name || item.file_name || entry.title,
      imageUrl: resolveNewsletterMediaUrl(entry.id, item),
    })),
  }
}

export function resolveNewsletterDownload(
  entry: NewsletterDetailResponse,
): NewsletterDownloadTarget | null {
  const media = getSortedNewsletterMedia(entry)
  const preferredMedia = media.find((item) => isPdfNewsletterMedia(item)) ?? media[0] ?? null

  if (!preferredMedia) {
    return null
  }

  return {
    url: resolveNewsletterMediaUrl(entry.id, preferredMedia),
    fileName:
      preferredMedia.file_name ||
      preferredMedia.display_name ||
      `${entry.title}.pdf`,
  }
}

export function getNewsletterCategoryLabel(category: string) {
  const normalizedCategory = category.trim().toLowerCase()

  if (normalizedCategory === 'cst') {
    return 'CST'
  }

  if (normalizedCategory === 'csaa') {
    return 'CSAA'
  }

  return normalizedCategory ? normalizedCategory.toUpperCase() : 'NEWSLETTER'
}

export function getNewsletterYear(sendDate: string) {
  const parsed = new Date(sendDate)
  return Number.isNaN(parsed.getTime()) ? sendDate.slice(0, 4) : String(parsed.getFullYear())
}

function htmlToText(contentHtml: string) {
  if (!contentHtml.trim()) {
    return ''
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(contentHtml, 'text/html')
    return doc.body.textContent ?? ''
  }

  return contentHtml.replace(/<[^>]+>/g, ' ')
}
