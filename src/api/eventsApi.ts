import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type EventStatus = 'published' | 'draft'
export type EventType =
  | 'single_day_all_day'
  | 'single_day_partial'
  | 'multi_day_all_day'
  | 'multi_day_partial'
export type LocationMode = 'none' | 'to_be_determined' | 'address'

export type EventAddress = {
  id: number
  name: string
  address_line_1: string
  address_line_2: string
  city: string
  province_state: string
  postal_code: string
  country: string
  is_saved: boolean
  created_at: string
  updated_at: string
}

export type EventMedia = {
  id: number
  event_id: number
  media_role: 'display_image' | 'attachment'
  display_name: string
  gcp_object_key: string
  file_url: string
  fetch_url?: string
  storage_uri?: string
  mime_type: string
  file_size: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type EventOccurrence = {
  id: number
  event_id: number
  occurrence_start_at: string
  occurrence_end_at?: string | null
  occurrence_kind: string
  created_at: string
  updated_at: string
}

export type EventListItem = {
  id: number
  title: string
  categories: string[]
  status: EventStatus
  published: boolean
  event_type: EventType
  start_at: string
  end_at?: string | null
  date_display?: string
  created_at: string
  updated_at: string
}

export type EventListPageMeta = {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type EventListResponse = {
  items: EventListItem[]
  pagination: EventListPageMeta
  applied_filters: {
    page: number
    page_size: number
    search_term: string
    statuses: EventStatus[]
    start_date?: string | null
    end_date?: string | null
    date_range: 'custom'
    sort_by: 'start_at'
    sort_order: 'asc' | 'desc'
  }
}

export type EventDetailResponse = {
  id: number
  title: string
  show_title: boolean
  categories: string[]
  event_type: EventType
  start_at: string
  end_at?: string | null
  date_display?: string
  privacy_type: 'public' | 'private'
  private_audiences: string[]
  published: boolean
  request_review: boolean
  review_email_list: string[]
  teaser: string
  description_html: string
  contact_name: string
  contact_email: string
  contact_phone: string
  contact_ext: string
  contact_fax: string
  location_mode: LocationMode
  address?: EventAddress | null
  show_display_image_when_viewing: boolean
  gallery_id?: number | null
  registration_enabled: boolean
  registration_start_at?: string | null
  registration_end_at?: string | null
  registration_url: string
  repeat_enabled: boolean
  recurrence_type?: string | null
  recurrence_frequency?: string | null
  recurrence_interval: number
  recurrence_until?: string | null
  recurrence_rule?: unknown
  occurrences: EventOccurrence[]
  display_image?: EventMedia | null
  attachments: EventMedia[]
  created_by?: number | null
  created_at: string
  updated_at: string
}

export type PublicEventListResponse = {
  items: EventDetailResponse[]
  pagination: EventListPageMeta
}

type PublicListQuery = {
  referenceDate: string
  page?: number
  pageSize?: number
}

type PublicDateRangeQuery = {
  startDate: string
  endDate: string
  page?: number
}

function buildPublicListParams(
  mode: 'upcoming' | 'archive',
  query: PublicListQuery,
) {
  const params = new URLSearchParams()
  params.set('date_range', 'custom')
  params.set('status', 'published')
  params.set('sort_by', 'start_at')
  params.set('sort_order', mode === 'upcoming' ? 'asc' : 'desc')

  if (mode === 'upcoming') {
    params.set('start_date', query.referenceDate)
  } else {
    params.set('end_date', query.referenceDate)
    params.set('page', String(query.page ?? 1))
    params.set('page_size', String(query.pageSize ?? 10))
  }

  return params
}

function buildPublicDateRangeParams(query: PublicDateRangeQuery) {
  const params = new URLSearchParams()
  params.set('date_range', 'custom')
  params.set('status', 'published')
  params.set('sort_by', 'start_at')
  params.set('sort_order', 'asc')
  params.set('start_date', query.startDate)
  params.set('end_date', query.endDate)
  if (query.page) {
    params.set('page', String(query.page))
  }
  return params
}

async function listDetailedEventsWithParams(params: URLSearchParams) {
  const response = await apiClient.get<EventListResponse>(API_ROUTES.events, {
    params,
    skipAuth: true,
    skipErrorToast: true,
  })

  const items = await Promise.all(
    response.data.items.map((item) => eventsApi.getEvent(item.id)),
  )

  return {
    items,
    pagination: response.data.pagination,
  } satisfies PublicEventListResponse
}

function listDetailedEvents(
  mode: 'upcoming' | 'archive',
  query: PublicListQuery,
) {
  return listDetailedEventsWithParams(buildPublicListParams(mode, query))
}

export const eventsApi = {
  async listUpcomingEvents(referenceDate: string) {
    return listDetailedEvents('upcoming', {
      referenceDate,
    })
  },

  async listArchivedEvents(referenceDate: string, page = 1, pageSize = 10) {
    return listDetailedEvents('archive', {
      referenceDate,
      page,
      pageSize,
    })
  },

  async listEventsByDateRange(startDate: string, endDate: string) {
    const firstPage = await listDetailedEventsWithParams(
      buildPublicDateRangeParams({
        startDate,
        endDate,
      }),
    )

    if (firstPage.pagination.total_pages <= 1) {
      return firstPage
    }

    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.pagination.total_pages - 1 }, (_, index) =>
        listDetailedEventsWithParams(
          buildPublicDateRangeParams({
            startDate,
            endDate,
            page: index + 2,
          }),
        ),
      ),
    )

    return {
      items: [
        ...firstPage.items,
        ...remainingPages.flatMap((page) => page.items),
      ],
      pagination: firstPage.pagination,
    } satisfies PublicEventListResponse
  },

  async getEvent(id: number) {
    const response = await apiClient.get<EventDetailResponse>(
      API_ROUTES.eventById(id),
      {
        skipAuth: true,
        skipErrorToast: true,
      },
    )
    return response.data
  },
}
