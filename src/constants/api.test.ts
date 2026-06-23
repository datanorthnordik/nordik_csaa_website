import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  API_BASE_URL,
  API_ROUTES,
  buildApiUrl,
  resolveApiBaseUrl,
  resolveApiUrl,
} from './api'

describe('API_ROUTES', () => {
  afterEach(() => {
    window.__APP_CONFIG__ = undefined
    vi.unstubAllEnvs()
  })

  it('falls back to the default API base URL', () => {
    expect(API_BASE_URL).toBe(
      'https://nordikcsaaapi-724838782318.us-west1.run.app',
    )
  })

  it('prefers the Cloud Run runtime API base URL when present', () => {
    window.__APP_CONFIG__ = {
      API_BASE_URL: 'https://api.example.com/',
    }

    expect(resolveApiBaseUrl()).toBe('https://api.example.com')
  })

  it('falls back to the Vite API base URL for local builds', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://local.example.com/')

    expect(resolveApiBaseUrl()).toBe('https://local.example.com')
  })

  it('builds relative API paths against the configured host', () => {
    expect(buildApiUrl('/api/videos/12')).toBe(`${API_BASE_URL}/api/videos/12`)
    expect(resolveApiUrl('/api/videos/12')).toBe(`${API_BASE_URL}/api/videos/12`)
  })

  it('keeps absolute URLs unchanged when resolving API URLs', () => {
    expect(resolveApiUrl('https://files.example.com/video.mp4')).toBe(
      'https://files.example.com/video.mp4',
    )
  })

  it('builds route paths for the public APIs', () => {
    expect(API_ROUTES.login).toBe('/api/user/login')
    expect(API_ROUTES.signup).toBe('/api/user/signup')
    expect(API_ROUTES.refresh).toBe('/api/user/refresh')
    expect(API_ROUTES.pages).toBe('/api/pages')
    expect(API_ROUTES.pageBySlug).toBe('/api/pages/by-slug')
    expect(API_ROUTES.galleries).toBe('/api/galleries')
    expect(API_ROUTES.galleryById(5)).toBe('/api/galleries/5')
    expect(API_ROUTES.navigation).toBe('/api/navigation')
    expect(API_ROUTES.menus).toBe('/api/menus')
    expect(API_ROUTES.menuByKey('main')).toBe('/api/menus/main')
    expect(API_ROUTES.events).toBe('/api/events')
    expect(API_ROUTES.eventById(42)).toBe('/api/events/42')
    expect(API_ROUTES.eventMediaById(42, 7)).toBe('/api/events/42/media/7/content')
    expect(API_ROUTES.news).toBe('/api/news')
    expect(API_ROUTES.press).toBe('/api/press')
    expect(API_ROUTES.pressById(3)).toBe('/api/press/3')
    expect(API_ROUTES.pressCoverById(3)).toBe('/api/press/3/cover/content')
    expect(API_ROUTES.pressMediaById(3, 8)).toBe('/api/press/3/media/8/content')
    expect(API_ROUTES.blogs).toBe('/api/blogs')
    expect(API_ROUTES.blogById(4)).toBe('/api/blogs/4')
    expect(API_ROUTES.newsletters).toBe('/api/newsletters')
    expect(API_ROUTES.newsletterById(9)).toBe('/api/newsletters/9')
    expect(API_ROUTES.newsletterMediaById(9, 2)).toBe(
      '/api/newsletters/9/media/2/content',
    )
    expect(API_ROUTES.publicBooks).toBe('/api/books/public')
    expect(API_ROUTES.publicBookById(11)).toBe('/api/books/public/11')
    expect(API_ROUTES.publicBookPdfById(11)).toBe('/api/books/public/11/pdf/content')
    expect(API_ROUTES.publicBookSubmissionById(11)).toBe(
      '/api/books/public/11/submissions',
    )
    expect(API_ROUTES.memorials).toBe('/api/memorial')
    expect(API_ROUTES.memorialById(6)).toBe('/api/memorial/6')
    expect(API_ROUTES.memorialPortraitById(6)).toBe(
      '/api/memorial/6/portrait/content',
    )
    expect(API_ROUTES.memorialGalleryImageById(6, 10)).toBe(
      '/api/memorial/6/gallery/10/content',
    )
    expect(API_ROUTES.resources).toBe('/api/resources')
    expect(API_ROUTES.resourceById(13)).toBe('/api/resources/13')
    expect(API_ROUTES.resourceContentById(13)).toBe('/api/resources/13/content')
    expect(API_ROUTES.knowledgeCenterSubmissions).toBe(
      '/api/knowledge-center/submissions',
    )
    expect(API_ROUTES.videoPackageById(12)).toBe('/api/videos/12')
    expect(API_ROUTES.videoItemTeaserContent(12, 5)).toBe(
      '/api/videos/12/items/5/teaser/content',
    )
  })
})
