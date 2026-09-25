import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type LatestContentSourceType = 'event' | 'newsletter' | 'press'

type LatestContentApiItem = {
  id: number
  source_type: LatestContentSourceType
  source_id: number
  title: string
  description: string
  display_date: string
  published_at: string
  detail_path: string
}

type LatestContentApiResponse = {
  items: LatestContentApiItem[] | null
}

export type LatestContentItem = {
  id: number
  sourceType: LatestContentSourceType
  sourceId: number
  title: string
  description: string
  displayDate: string
  publishedAt: string
  detailPath: string
}

export function mapLatestContentItem(item: LatestContentApiItem): LatestContentItem {
  return {
    id: item.id,
    sourceType: item.source_type,
    sourceId: item.source_id,
    title: item.title,
    description: item.description,
    displayDate: item.display_date,
    publishedAt: item.published_at,
    detailPath: item.detail_path,
  }
}

export const latestContentApi = {
  async listLatestContent(limit = 3) {
    const response = await apiClient.get<LatestContentApiResponse>(
      API_ROUTES.latestContent,
      {
        params: { limit },
        skipAuth: true,
        skipErrorToast: true,
      },
    )

    return (response.data.items ?? []).map(mapLatestContentItem)
  },
}
