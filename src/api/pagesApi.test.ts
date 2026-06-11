import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './apiClient'
import { pagesApi } from './pagesApi'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

describe('pagesApi', () => {
  beforeEach(() => {
    apiGet.mockReset()
    pagesApi.clearPageBySlugCache()
  })

  it('fetches public CMS pages by slug without auth', async () => {
    apiGet.mockResolvedValue({
      data: {
        id: 1,
        page_title: 'Home',
        url_slug: '/home',
      },
    })

    const response = await pagesApi.getPageBySlug('/home')

    expect(apiGet).toHaveBeenCalledWith('/api/pages/by-slug', {
      params: {
        slug: '/home',
      },
      skipAuth: true,
      skipErrorToast: true,
    })
    expect(response).toEqual({
      id: 1,
      page_title: 'Home',
      url_slug: '/home',
    })
  })

  it('reuses the in-flight request when a CMS page is preloaded before it renders', async () => {
    apiGet.mockResolvedValue({
      data: {
        id: 36,
        page_title: 'CSAA Members',
        url_slug: '/community-support-team/csaa-members',
      },
    })

    const preloadedPromise = pagesApi.preloadPageBySlug('/community-support-team/csaa-members')
    const response = await pagesApi.getPageBySlug('/community-support-team/csaa-members')

    await expect(preloadedPromise).resolves.toEqual(response)
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(
      pagesApi.peekPageBySlug('/community-support-team/csaa-members'),
    ).toEqual(response)
  })
})
