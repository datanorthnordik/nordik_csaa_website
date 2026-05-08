const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

export const API_ROUTES = {
  login: '/api/user/login',
  signup: '/api/user/signup',
  refresh: '/api/user/refresh',
  pages: '/api/pages',
  pageBySlug: (slug: string) => `/api/pages/${slug}`,
  navigation: '/api/navigation',
  events: '/api/events',
  news: '/api/news',
} as const
