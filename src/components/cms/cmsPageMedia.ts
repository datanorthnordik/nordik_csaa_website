import type { PageDocument } from '../../api/pagesApi'
import { API_BASE_URL } from '../../constants/api'

export function resolveCmsAssetUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed || /^gs:\/\//i.test(trimmed)) {
    return null
  }

  if (trimmed.startsWith('/api/')) {
    return `${API_BASE_URL}${trimmed}`
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return null
}

export function getDocumentBadge(document: PageDocument) {
  const fileName = document.file_name || document.original_file_name
  const extension = fileName.includes('.')
    ? fileName.split('.').pop()
    : document.mime_type.split('/').pop()

  return extension?.toUpperCase() ?? 'FILE'
}

export function normalizeCmsLabel(value: string) {
  return value.trim().toLowerCase()
}
