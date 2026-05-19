import type { GalleryAssetResponse, GalleryDetailResponse } from '../../api/galleriesApi'
import { resolveCmsAssetUrl } from './cmsPageMedia'

export type CmsGalleryViewMode = 'grid' | 'carousel' | 'masonry' | 'focus'

export type CmsGalleryAsset = {
  id: number
  title: string
  details: string
  altText: string
  imageUrl: string
  fileUrl: string
  sortOrder: number
}

export function normalizeGalleryViewMode(value?: string | null): CmsGalleryViewMode {
  switch (value?.trim().toLowerCase()) {
    case 'carousel':
      return 'carousel'
    case 'masonry':
      return 'masonry'
    case 'focus':
    case 'focused':
      return 'focus'
    case 'grid':
    default:
      return 'grid'
  }
}

export function buildCmsGalleryAssets(gallery: GalleryDetailResponse): CmsGalleryAsset[] {
  const items = (gallery.images ?? [])
    .map((item) => mapCmsGalleryAsset(item, gallery.name))
    .filter((item): item is CmsGalleryAsset => item !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id)

  if (items.length > 0) {
    return items
  }

  const coverItem = gallery.cover_image
    ? mapCmsGalleryAsset(gallery.cover_image, gallery.name)
    : null

  return coverItem ? [{ ...coverItem, sortOrder: -1 }] : []
}

function mapCmsGalleryAsset(
  item: GalleryAssetResponse,
  galleryName: string,
): CmsGalleryAsset | null {
  const imageUrl = resolveCmsAssetUrl(item.file_url || item.storage_uri)
  if (!imageUrl) {
    return null
  }

  const title = item.title.trim()
  const details = item.alt_text.trim()

  return {
    id: item.id,
    title,
    details,
    altText: details || title || galleryName.trim() || 'Gallery image',
    imageUrl,
    fileUrl: imageUrl,
    sortOrder: item.sort_order ?? 0,
  }
}
