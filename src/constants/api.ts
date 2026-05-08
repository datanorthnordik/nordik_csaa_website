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
  pageBySlug: (slug: string) => `/api/pages/${slug}`,
  navigation: '/api/navigation',
  events: '/api/events',
  eventById: (id: number | string) => `/api/events/${id}`,
  eventMediaById: (id: number | string, mediaId: number | string) =>
    `/api/events/${id}/media/${mediaId}/content`,
  news: '/api/news',
} as const
