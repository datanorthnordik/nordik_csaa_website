import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type PressMediaResponse = {
  id: number
  display_name: string
  file_name: string
  gcp_object_key?: string
  file_url: string
  mime_type: string
  file_size: number
  media_role: 'attachment' | string
  sort_order: number
  created_at: string
  updated_at: string
}

export type PressSummaryItem = {
  id: number
  title: string
  release_date: string
  status: 'draft' | 'published' | 'archived' | string
  visibility: 'public' | 'private' | 'scheduled' | string
  cover_image_url: string
  created_at: string
  updated_at: string
}

export type PressListResponse = {
  items: PressSummaryItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type PressDetailResponse = PressSummaryItem & {
  category_id: number | null
  source_url: string
  content_html: string
  cover_image_gcp_key: string
  publish_at: string | null
  media: PressMediaResponse[]
}

const publicPressParams = {
  status: 'published',
  visibility: 'public',
  sort_by: 'release_date',
  sort_order: 'desc',
} as const

async function fetchPressPage(page: number, pageSize: number) {
  const response = await apiClient.get<PressListResponse>(API_ROUTES.press, {
    params: {
      ...publicPressParams,
      page,
      page_size: pageSize,
    },
    skipAuth: true,
    skipErrorToast: true,
  })

  return response.data
}

export const pressApi = {
  async getPressEntry(id: number) {
    const response = await apiClient.get<PressDetailResponse>(API_ROUTES.pressById(id), {
      skipAuth: true,
      skipErrorToast: true,
    })

    return response.data
  },

  async listPublishedPressEntries(pageSize = 100) {
    const firstPage = await fetchPressPage(1, pageSize)

    if (!firstPage.items.length) {
      return []
    }

    const remainingPages =
      firstPage.total_pages > 1
        ? await Promise.all(
            Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
              fetchPressPage(index + 2, pageSize),
            ),
          )
        : []

    const summaries = [
      ...firstPage.items,
      ...remainingPages.flatMap((page) => page.items),
    ]

    return Promise.all(summaries.map((item) => pressApi.getPressEntry(item.id)))
  },
}
