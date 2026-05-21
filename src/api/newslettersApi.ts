import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type NewsletterMediaResponse = {
  id: number
  display_name: string
  file_name: string
  gcp_object_key?: string
  file_url: string
  mime_type: string
  file_size: number
  media_role: 'attachment'
  sort_order: number
  created_at: string
  updated_at: string
}

export type NewsletterSummaryItem = {
  id: number
  title: string
  category: string
  send_date: string
  status: 'draft' | 'published' | string
  visibility: 'public' | 'private' | string
  created_at: string
  updated_at: string
}

export type NewsletterListResponse = {
  items: NewsletterSummaryItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type NewsletterDetailResponse = NewsletterSummaryItem & {
  content_html: string
  publish_at: string | null
  media: NewsletterMediaResponse[]
}

const publicNewsletterParams = {
  status: 'published',
  visibility: 'public',
  sort_by: 'send_date',
  sort_order: 'desc',
} as const

async function fetchNewsletterPage(page: number, pageSize: number) {
  const response = await apiClient.get<NewsletterListResponse>(API_ROUTES.newsletters, {
    params: {
      ...publicNewsletterParams,
      page,
      page_size: pageSize,
    },
    skipAuth: true,
    skipErrorToast: true,
  })

  return response.data
}

export const newslettersApi = {
  async getNewsletter(id: number) {
    const response = await apiClient.get<NewsletterDetailResponse>(
      API_ROUTES.newsletterById(id),
      {
        skipAuth: true,
        skipErrorToast: true,
      },
    )

    return response.data
  },

  async listPublishedNewsletters(pageSize = 100) {
    const firstPage = await fetchNewsletterPage(1, pageSize)

    if (!firstPage.items.length) {
      return []
    }

    const remainingPages =
      firstPage.total_pages > 1
        ? await Promise.all(
            Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
              fetchNewsletterPage(index + 2, pageSize),
            ),
          )
        : []

    const summaries = [
      ...firstPage.items,
      ...remainingPages.flatMap((page) => page.items),
    ]

    return Promise.all(summaries.map((item) => newslettersApi.getNewsletter(item.id)))
  },
}
