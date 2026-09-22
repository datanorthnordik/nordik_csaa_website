import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type RecordingItemResponse = {
  id: number
  recording_collection_id: number
  title: string
  description?: string | null
  recording_url?: string | null
  storage_uri?: string
  gcp_object_key?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export type RecordingCollectionSummary = {
  id: number
  name: string
  item_count: number
  created_at: string
  updated_at: string
}

export type RecordingCollectionListResponse = {
  items: RecordingCollectionSummary[]
}

export type RecordingCollectionDetailResponse = {
  id: number
  name: string
  item_count: number
  items: RecordingItemResponse[]
  created_at: string
  updated_at: string
}

export const recordingsApi = {
  async listCollections() {
    const response = await apiClient.get<RecordingCollectionListResponse>(
      API_ROUTES.recordings,
      { skipAuth: true, skipErrorToast: true },
    )

    return response.data
  },

  async getCollection(id: number | string) {
    const response = await apiClient.get<RecordingCollectionDetailResponse>(
      API_ROUTES.recordingById(id),
      { skipAuth: true, skipErrorToast: true },
    )

    return response.data
  },
}
