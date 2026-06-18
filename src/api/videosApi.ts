import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type VideoPackageType = 'collection' | string

export type VideoItemResponse = {
  id: number
  video_package_id: number
  title: string
  youtube_url: string
  description: string
  teaser_image_url: string
  storage_uri?: string
  gcp_object_key?: string
  sort_order: number
  created_by?: number | null
  updated_by?: number | null
  created_at: string
  updated_at: string
}

export type VideoPackageResponse = {
  id: number
  title: string
  package_type: VideoPackageType
  video_count: number
  videos: VideoItemResponse[]
  created_by?: number | null
  updated_by?: number | null
  created_at: string
  updated_at: string
}

const PUBLIC_API_ORIGIN =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://nordikcsaaapi-724838782318.us-west1.run.app'

export function toAbsoluteApiUrl(pathOrUrl: string) {
  if (!pathOrUrl) {
    return ''
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  return new URL(pathOrUrl, PUBLIC_API_ORIGIN).toString()
}

export function getVideoTeaserUrl(video: VideoItemResponse) {
  if (video.teaser_image_url) {
    return toAbsoluteApiUrl(video.teaser_image_url)
  }

  return toAbsoluteApiUrl(
    API_ROUTES.videoItemTeaserContent(video.video_package_id, video.id),
  )
}

export const videosApi = {
  async getVideoPackage(id: number) {
    const response = await apiClient.get<VideoPackageResponse>(
      API_ROUTES.videoPackageById(id),
      {
        skipAuth: true,
        skipErrorToast: true,
      },
    )

    return response.data
  },
}