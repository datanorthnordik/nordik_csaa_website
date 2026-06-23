import { API_ROUTES, buildApiUrl, resolveApiUrl } from '../constants/api'
import { apiClient } from './apiClient'

export type PublicMemorialCategory =
  | 'alumnus'
  | 'veteran'
  | 'founder'
  | 'friend'

export type PublicMemorialStatus = 'draft' | 'review' | 'published'

export type PublicMemorialSortBy =
  | 'date_of_passing'
  | 'full_name'
  | 'created_at'
  | 'updated_at'
  | 'published_at'
  | 'date_of_birth'

export type PublicMemorialSortOrder = 'asc' | 'desc'

export type PublicMemorialEntry = {
  id: string
  fullName: string
  affiliation: string
  category: PublicMemorialCategory
  categoryLabel: string
  status: PublicMemorialStatus
  dateOfBirth: string
  dateOfPassing: string
  portraitContentUrl: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export type PublicMemorialListPageMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PublicMemorialListFilters = {
  page: number
  pageSize: number
  searchTerm?: string
  category?: PublicMemorialCategory | ''
  sortBy?: PublicMemorialSortBy
  sortOrder?: PublicMemorialSortOrder
}

export type PublicMemorialApiEntry = {
  id: number
  full_name: string
  affiliation: string
  category: PublicMemorialCategory
  category_label: string
  status: PublicMemorialStatus
  date_of_birth: string
  date_of_passing: string
  portrait_content_url: string
  created_at: string
  updated_at: string
  published_at?: string | null
}

export type PublicMemorialApiListResponse = {
  items: PublicMemorialApiEntry[]
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
      category: PublicMemorialCategory
      label: string
      count: number
    }>
    status_counts: Array<{
      status: PublicMemorialStatus
      label: string
      count: number
    }>
  }
  applied_filters: {
    page: number
    page_size: number
    search_term: string
    status: string
    category: string
    sort_by: PublicMemorialSortBy
    sort_order: PublicMemorialSortOrder
  }
}

function buildListQuery(filters: PublicMemorialListFilters) {
  const params = new URLSearchParams()

  params.set('page', String(filters.page))
  params.set('page_size', String(filters.pageSize))
  params.set('sort_by', filters.sortBy ?? 'date_of_passing')
  params.set('sort_order', filters.sortOrder ?? 'desc')

  const searchTerm = filters.searchTerm?.trim() ?? ''
  if (searchTerm) {
    params.set('search', searchTerm)
  }

  if (filters.category) {
    params.set('category', filters.category)
  }

  return params
}

export function publicMemorialApiEntryToLocal(
  entry: PublicMemorialApiEntry,
): PublicMemorialEntry {
  return {
    id: String(entry.id),
    fullName: entry.full_name,
    affiliation: entry.affiliation,
    category: entry.category,
    categoryLabel: entry.category_label || getMemorialCategoryLabel(entry.category),
    status: entry.status,
    dateOfBirth: entry.date_of_birth,
    dateOfPassing: entry.date_of_passing,
    portraitContentUrl: resolvePublicMemorialPortraitUrl({
      id: entry.id,
      portraitContentUrl: entry.portrait_content_url,
    }),
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
    publishedAt: entry.published_at ?? '',
  }
}

export function publicMemorialApiPageToLocal(
  pagination: PublicMemorialApiListResponse['pagination'],
): PublicMemorialListPageMeta {
  return {
    page: pagination.page,
    pageSize: pagination.page_size,
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
    hasNext: pagination.has_next,
    hasPrev: pagination.has_prev,
  }
}

export const publicMemorialsApi = {
  async listMemorials(filters: PublicMemorialListFilters) {
    const response = await apiClient.get<PublicMemorialApiListResponse>(
      API_ROUTES.memorials,
      {
        params: buildListQuery(filters),
        skipAuth: true,
        skipErrorToast: true,
      },
    )

    return {
      items: response.data.items.map(publicMemorialApiEntryToLocal),
      pagination: publicMemorialApiPageToLocal(response.data.pagination),
      summary: {
        categoryCounts: response.data.summary.category_counts,
        statusCounts: response.data.summary.status_counts,
      },
      appliedFilters: {
        page: response.data.applied_filters.page,
        pageSize: response.data.applied_filters.page_size,
        searchTerm: response.data.applied_filters.search_term,
        status: response.data.applied_filters.status,
        category: response.data.applied_filters.category as PublicMemorialListFilters['category'],
        sortBy: response.data.applied_filters.sort_by,
        sortOrder: response.data.applied_filters.sort_order,
      },
    }
  },
}

function buildMemorialPortraitUrl(id: number | string) {
  return buildApiUrl(API_ROUTES.memorialPortraitById(String(id)))
}

export function resolvePublicMemorialPortraitUrl(memorial: {
  id: number | string
  portraitContentUrl?: string | null
}) {
  const trimmed = memorial.portraitContentUrl?.trim()

  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith('/api/')) {
    return resolveApiUrl(trimmed)
  }

  return buildMemorialPortraitUrl(memorial.id)
}

function getMemorialCategoryLabel(category: PublicMemorialCategory) {
  switch (category) {
    case 'alumnus':
      return 'Alumnus'
    case 'veteran':
      return 'Veteran'
    case 'founder':
      return 'Founder'
    case 'friend':
      return 'Friend'
    default:
      return 'Memorial'
  }
}
