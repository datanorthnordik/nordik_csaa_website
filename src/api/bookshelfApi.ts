import { API_ROUTES, buildApiUrl, resolveApiUrl } from '../constants/api'
import { apiClient } from './apiClient'

export type PublicBookshelfEntry = {
  id: string
  author: string
  title: string
  bookLink: string
  authorBio: string
  bookTeaser: string
  description: string
  bookFileName: string
  bookMimeType: string
  bookFileSize: number
  bookContentUrl: string
  authorImageFileName: string
  authorImageMimeType: string
  authorImageFileSize: number
  hasAuthorImage: boolean
  authorImageContentUrl: string
  coverImageFileName: string
  coverImageMimeType: string
  coverImageFileSize: number
  hasCoverImage: boolean
  coverImageContentUrl: string
  createdAt: string
  updatedAt: string
}

export type PublicBookshelfListPageMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PublicBookshelfListFilters = {
  page: number
  pageSize: number
  searchTerm?: string
}

export type PublicBookshelfApiEntry = {
  id: number
  author: string
  title: string
  book_link: string
  author_bio: string
  book_teaser: string
  description: string
  book_file_name: string
  book_mime_type: string
  book_file_size: number
  book_content_url: string
  author_image_file_name: string
  author_image_mime_type: string
  author_image_file_size: number
  has_author_image: boolean
  author_image_content_url: string
  cover_image_file_name: string
  cover_image_mime_type: string
  cover_image_file_size: number
  has_cover_image: boolean
  cover_image_content_url: string
  created_at: string
  updated_at: string
}

export type PublicBookshelfApiListResponse = {
  items: PublicBookshelfApiEntry[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  summary: {
    with_cover_count: number
    without_cover_count: number
  }
  applied_filters: {
    page: number
    page_size: number
    search_term: string
  }
}

function buildListQuery(filters: PublicBookshelfListFilters) {
  const params = new URLSearchParams()

  params.set('page', String(filters.page))
  params.set('page_size', String(filters.pageSize))

  const searchTerm = filters.searchTerm?.trim() ?? ''
  if (searchTerm) {
    params.set('search', searchTerm)
  }

  return params
}

export function publicBookshelfApiEntryToLocal(
  entry: PublicBookshelfApiEntry,
): PublicBookshelfEntry {
  return {
    id: String(entry.id),
    author: entry.author,
    title: entry.title,
    bookLink: entry.book_link,
    authorBio: entry.author_bio,
    bookTeaser: entry.book_teaser,
    description: entry.description,
    bookFileName: entry.book_file_name,
    bookMimeType: entry.book_mime_type,
    bookFileSize: entry.book_file_size,
    bookContentUrl: resolvePublicBookshelfContentUrl({
      id: entry.id,
      contentUrl: entry.book_content_url,
    }),
    authorImageFileName: entry.author_image_file_name,
    authorImageMimeType: entry.author_image_mime_type,
    authorImageFileSize: entry.author_image_file_size,
    hasAuthorImage: entry.has_author_image,
    authorImageContentUrl: entry.has_author_image
      ? resolvePublicBookshelfAssetUrl(entry.author_image_content_url)
      : '',
    coverImageFileName: entry.cover_image_file_name,
    coverImageMimeType: entry.cover_image_mime_type,
    coverImageFileSize: entry.cover_image_file_size,
    hasCoverImage: entry.has_cover_image,
    coverImageContentUrl: entry.has_cover_image
      ? resolvePublicBookshelfAssetUrl(entry.cover_image_content_url)
      : '',
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }
}

export function publicBookshelfApiPageToLocal(
  pagination: PublicBookshelfApiListResponse['pagination'],
): PublicBookshelfListPageMeta {
  return {
    page: pagination.page,
    pageSize: pagination.page_size,
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
    hasNext: pagination.has_next,
    hasPrev: pagination.has_prev,
  }
}

export const publicBookshelfApi = {
  async listBooks(filters: PublicBookshelfListFilters) {
    const response = await apiClient.get<PublicBookshelfApiListResponse>(
      API_ROUTES.bookshelf,
      {
        params: buildListQuery(filters),
        skipAuth: true,
        skipErrorToast: true,
      },
    )

    return {
      items: response.data.items.map(publicBookshelfApiEntryToLocal),
      pagination: publicBookshelfApiPageToLocal(response.data.pagination),
      summary: {
        withCoverCount: response.data.summary.with_cover_count,
        withoutCoverCount: response.data.summary.without_cover_count,
      },
      appliedFilters: {
        page: response.data.applied_filters.page,
        pageSize: response.data.applied_filters.page_size,
        searchTerm: response.data.applied_filters.search_term,
      },
    }
  },
}

function buildBookshelfBookContentUrl(id: number | string) {
  return buildApiUrl(API_ROUTES.bookshelfBookContentById(String(id)))
}

export function resolvePublicBookshelfContentUrl(book: {
  id: number | string
  contentUrl?: string | null
}) {
  const trimmed = book.contentUrl?.trim()

  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed?.startsWith('/api/')) {
    return resolveApiUrl(trimmed)
  }

  return buildBookshelfBookContentUrl(book.id)
}

export function resolvePublicBookshelfAssetUrl(contentUrl?: string | null) {
  return resolveApiUrl(contentUrl)
}
