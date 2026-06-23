const DEFAULT_API_BASE_URL =
  'https://nordikcsaaapi-724838782318.us-west1.run.app'
const ABSOLUTE_URL_PATTERN = /^[a-z][a-z0-9+.-]*:/i

const normalizeApiBaseUrl = (value: string | undefined) => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  return trimmed.replace(/\/+$/, '')
}

const getRuntimeApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.__APP_CONFIG__?.API_BASE_URL
}

export const resolveApiBaseUrl = () =>
  normalizeApiBaseUrl(getRuntimeApiBaseUrl()) ??
  normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL) ??
  DEFAULT_API_BASE_URL

export const API_BASE_URL = resolveApiBaseUrl()

export const buildApiUrl = (path: string) =>
  new URL(path.trim().replace(/^\/+/, ''), `${API_BASE_URL}/`).toString()

export const resolveApiUrl = (value: string | null | undefined) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    return ''
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith('//')) {
    return trimmed
  }

  try {
    return buildApiUrl(trimmed)
  } catch {
    return trimmed
  }
}

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
  blogs: '/api/blogs',
  blogById: (id: number | string) => `/api/blogs/${id}`,
  newsletters: '/api/newsletters',
  newsletterById: (id: number | string) => `/api/newsletters/${id}`,
  newsletterMediaById: (id: number | string, mediaId: number | string) =>
    `/api/newsletters/${id}/media/${mediaId}/content`,
  publicBooks: '/api/books/public',
  publicBookById: (id: number | string) => `/api/books/public/${id}`,
  publicBookPdfById: (id: number | string) => `/api/books/public/${id}/pdf/content`,
  publicBookSubmissionById: (id: number | string) => `/api/books/public/${id}/submissions`,
  memorials: '/api/memorial',
  memorialById: (id: number | string) => `/api/memorial/${id}`,
  memorialPortraitById: (id: number | string) =>
    `/api/memorial/${id}/portrait/content`,
  memorialGalleryImageById: (id: number | string, mediaId: number | string) =>
    `/api/memorial/${id}/gallery/${mediaId}/content`,
  resources: '/api/resources',
  resourceById: (id: number | string) => `/api/resources/${id}`,
  resourceContentById: (id: number | string) => `/api/resources/${id}/content`,
  knowledgeCenterSubmissions: '/api/knowledge-center/submissions',
  videoPackageById: (id: number) => `/api/videos/${id}`,
  videoItemTeaserContent: (packageId: number, itemId: number) =>
    `/api/videos/${packageId}/items/${itemId}/teaser/content`,
} as const
