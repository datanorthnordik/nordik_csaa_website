<<<<<<< HEAD
import type { PageDocument } from '../../api/pagesApi'
=======
import type { PageDetailResponse, PageDocument, PageSectionAsset } from '../../api/pagesApi'
>>>>>>> 7c0fbf18d0265774dcd451f52c7f4852d611d0ee
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

<<<<<<< HEAD
=======
export function resolveUploadedCmsAssetUrl(asset?: PageSectionAsset | null) {
  const hasUploadedAsset = Boolean(
    asset?.gcp_object_key?.trim() || asset?.storage_uri?.trim(),
  )

  if (!hasUploadedAsset) {
    return null
  }

  return resolveCmsAssetUrl(asset?.fetch_url) ?? resolveCmsAssetUrl(asset?.file_url)
}

export function resolvePageHeroImageUrl(
  page: Pick<
    PageDetailResponse,
    'hero_image_enabled' | 'hero_image_fetch_url' | 'hero_image_object_key'
  >,
) {
  if (!page.hero_image_enabled || !page.hero_image_object_key.trim()) {
    return null
  }

  return resolveCmsAssetUrl(page.hero_image_fetch_url)
}

>>>>>>> 7c0fbf18d0265774dcd451f52c7f4852d611d0ee
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
