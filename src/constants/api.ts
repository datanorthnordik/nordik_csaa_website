const defaultApiBaseUrl =
  'https://nordikcsaaapi-724838782318.us-west1.run.app'

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ?? defaultApiBaseUrl

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

export const API_ROUTES = {
  login: '/api/user/login',
  signup: '/api/user/signup',
  refresh: '/api/user/refresh',
  pages: '/api/pages',
  pageBySlug: '/api/pages/by-slug',
  galleries: '/api/galleries',
  galleryById: (id: number | string) => `/api/galleries/${id}`,
  navigation: '/api/navigation',
  menus: '/api/menus',
  menuByKey: (menuKey: string) => `/api/menus/${menuKey}`,
  events: '/api/events',
  eventById: (id: number | string) => `/api/events/${id}`,
  eventMediaById: (id: number | string, mediaId: number | string) =>
    `/api/events/${id}/media/${mediaId}/content`,
  news: '/api/news',
  press: '/api/press',
  pressById: (id: number | string) => `/api/press/${id}`,
  pressCoverById: (id: number | string) => `/api/press/${id}/cover/content`,
  pressMediaById: (id: number | string, mediaId: number | string) =>
    `/api/press/${id}/media/${mediaId}/content`,
  newsletters: '/api/newsletters',
  newsletterById: (id: number | string) => `/api/newsletters/${id}`,
  newsletterMediaById: (id: number | string, mediaId: number | string) =>
    `/api/newsletters/${id}/media/${mediaId}/content`,
} as const
