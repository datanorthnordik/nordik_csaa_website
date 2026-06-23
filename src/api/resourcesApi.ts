import { API_ROUTES, buildApiUrl, resolveApiUrl } from '../constants/api'
import { apiClient } from './apiClient'

export type PublicResourceCategory = 'educational' | 'media' | 'link' | 'report'
export type PublicResourceVisibility = 'public' | 'internal'
export type PublicResourceFileType =
  | 'all'
  | 'link'
  | 'pdf'
  | 'document'
  | 'presentation'
  | 'spreadsheet'
  | 'image'
  | 'vector'
  | 'other'

export type PublicResourceEntry = {
  id: string
  name: string
  description: string
  category: PublicResourceCategory
  categoryLabel: string
  visibility: PublicResourceVisibility
  linkUrl: string
  fileName: string
  mimeType: string
  fileSize: number
  hasDocument: boolean
  contentUrl: string
  createdAt: string
  updatedAt: string
}

export type PublicResourceListPageMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PublicResourceCategoryCount = {
  category: PublicResourceCategory
  label: string
  count: number
}

export type PublicResourceListFilters = {
  page: number
  pageSize: number
  searchTerm?: string
  category?: PublicResourceCategory | ''
  fileType?: PublicResourceFileType
}

export type PublicResourceApiEntry = {
  id: number
  name: string
  description: string
  category: PublicResourceCategory
  category_label: string
  visibility: PublicResourceVisibility
  link_url: string
  file_name: string
  mime_type: string
  file_size: number
  has_document: boolean
  content_url: string
  created_at: string
  updated_at: string
}

export type PublicResourceApiListResponse = {
  items: PublicResourceApiEntry[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  summary: {
    category_counts: Array<{
      category: PublicResourceCategory
      label: string
      count: number
    }>
  }
  applied_filters: {
    page: number
    page_size: number
    search_term: string
    category: string
    file_type: PublicResourceFileType
  }
}

function buildListQuery(filters: PublicResourceListFilters) {
  const params = new URLSearchParams()

  params.set('page', String(filters.page))
  params.set('page_size', String(filters.pageSize))
  params.set('file_type', filters.fileType ?? 'all')

  const searchTerm = filters.searchTerm?.trim() ?? ''
  if (searchTerm) {
    params.set('search', searchTerm)
  }

  if (filters.category) {
    params.set('category', filters.category)
  }

  return params
}

export function publicResourceApiEntryToLocal(
  entry: PublicResourceApiEntry,
): PublicResourceEntry {
  return {
    id: String(entry.id),
    name: entry.name,
    description: entry.description,
    category: entry.category,
    categoryLabel: entry.category_label || getResourceCategoryLabel(entry.category),
    visibility: entry.visibility,
    linkUrl: entry.link_url,
    fileName: entry.file_name,
    mimeType: entry.mime_type,
    fileSize: entry.file_size,
    hasDocument: entry.has_document,
    contentUrl: resolvePublicResourceContentUrl({
      id: entry.id,
      contentUrl: entry.content_url,
    }),
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }
}

export function publicResourceApiPageToLocal(
  pagination: PublicResourceApiListResponse['pagination'],
): PublicResourceListPageMeta {
  return {
    page: pagination.page,
    pageSize: pagination.page_size,
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
    hasNext: pagination.has_next,
    hasPrev: pagination.has_prev,
  }
}

export const publicResourcesApi = {
  async listResources(filters: PublicResourceListFilters) {
    const response = await apiClient.get<PublicResourceApiListResponse>(
      API_ROUTES.resources,
      {
        params: buildListQuery(filters),
        skipErrorToast: true,
      },
    )

    const publicItems = response.data.items
      .map(publicResourceApiEntryToLocal)
      .filter((item) => item.visibility === 'public')

    return {
      items: publicItems,
      pagination: publicResourceApiPageToLocal(response.data.pagination),
      summary: {
        categoryCounts: response.data.summary.category_counts,
      },
      appliedFilters: {
        page: response.data.applied_filters.page,
        pageSize: response.data.applied_filters.page_size,
        searchTerm: response.data.applied_filters.search_term,
        category: response.data.applied_filters.category as PublicResourceListFilters['category'],
        fileType: response.data.applied_filters.file_type,
      },
    }
  },

  async getResource(id: string) {
    const response = await apiClient.get<PublicResourceApiEntry>(
      API_ROUTES.resourceById(id),
      {
        skipErrorToast: true,
      },
    )

    return publicResourceApiEntryToLocal(response.data)
  },

  async getResourceContent(id: string) {
    const response = await apiClient.get<Blob>(
      API_ROUTES.resourceContentById(id),
      {
        responseType: 'blob',
        skipErrorToast: true,
      },
    )

    return response.data
  },
}

function buildResourceContentUrl(id: number | string) {
  return buildApiUrl(API_ROUTES.resourceContentById(String(id)))
}

export function resolvePublicResourceContentUrl(resource: {
  id: number | string
  contentUrl?: string | null
}) {
  const trimmed = resource.contentUrl?.trim()

  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed?.startsWith('/api/')) {
    return resolveApiUrl(trimmed)
  }

  return buildResourceContentUrl(resource.id)
}

function getResourceCategoryLabel(category: PublicResourceCategory) {
  switch (category) {
    case 'educational':
      return 'Educational'
    case 'media':
      return 'Media'
    case 'link':
      return 'Link'
    case 'report':
      return 'Report'
    default:
      return 'Resources'
  }
}
