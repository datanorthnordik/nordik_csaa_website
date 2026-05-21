import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type GalleryAssetResponse = {
  id: number
  gallery_id: number
  title: string
  alt_text: string
  link_url?: string | null
  file_name: string
  gcp_object_key?: string
  file_url: string
  storage_uri?: string
  mime_type?: string
  file_size?: number
  sort_order?: number
  uploaded_by?: number | null
  created_at: string
  updated_at: string
}

export type GalleryDetailResponse = {
  id: number
  name: string
  description: string
  published: boolean
  asset_limit: number
  cover_image?: GalleryAssetResponse | null
  images: GalleryAssetResponse[]
  created_by?: number | null
  updated_by?: number | null
  created_at: string
  updated_at: string
}

export const galleriesApi = {
  async getGallery(id: number) {
    const response = await apiClient.get<GalleryDetailResponse>(API_ROUTES.galleryById(id), {
      skipAuth: true,
      skipErrorToast: true,
    })

    return response.data
  },
}
