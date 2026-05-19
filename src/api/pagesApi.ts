import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type PageSectionType =
  | 'header'
  | 'typography'
  | 'gallery'
  | 'document'
  | 'quote'
  | 'cta_banner'

export type PageHeaderSection = {
  main_header_text: string
  sub_header_text: string
  hierarchy: 'h1_hero' | 'h2_section' | string
}

export type PageTypographySection = {
  html_content: string
  text_content: string
  text_align: 'left' | 'center' | 'right' | string
}

export type PageGallerySection = {
  gallery_id: number | null
  view_mode: 'grid' | 'carousel' | 'masonry' | 'focus' | string
}

export type PageQuoteSection = {
  quote_content: string
  attribution: string
}

export type PageCtaBannerSection = {
  banner_heading: string
  banner_message: string
  button_text: string
  button_url: string
  open_in_new_tab: boolean
}

export type PageDocument = {
  id: number
  display_name: string
  description: string
  original_file_name: string
  file_name: string
  file_url: string
  fetch_url: string
  storage_uri: string
  gcp_object_key: string
  mime_type: string
  file_size: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type PageDocumentSection = {
  items: PageDocument[]
}

export type PageSection = {
  id: number
  section_name: string
  section_type: PageSectionType | string
  sort_order: number
  is_enabled: boolean
  settings: Record<string, unknown>
  header?: PageHeaderSection | null
  typography?: PageTypographySection | null
  gallery?: PageGallerySection | null
  quote?: PageQuoteSection | null
  cta_banner?: PageCtaBannerSection | null
  documents?: PageDocumentSection | null
}

export type PageContentDetail = {
  id: number
  page_id: number
  template_key: string
  settings: Record<string, unknown>
  schema_version: number
  sections: PageSection[]
}

export type PageDetailResponse = {
  id: number
  page_title: string
  url_slug: string
  parent_id: number | null
  page_type: 'page' | 'module' | string
  parent_page_title: string
  parent_page_url_slug: string
  status: 'published' | 'draft' | string
  hero_image_enabled: boolean
  hero_image_url: string
  hero_image_object_key: string
  hero_image_fetch_url: string
  seo_page_title: string
  seo_page_description: string
  created_at: string
  updated_at: string
  page_detail?: PageContentDetail | null
}

export const pagesApi = {
  async getPageBySlug(slug: string) {
    const response = await apiClient.get<PageDetailResponse>(API_ROUTES.pageBySlug, {
      params: {
        slug,
      },
      skipAuth: true,
      skipErrorToast: true,
    })

    return response.data
  },
}
