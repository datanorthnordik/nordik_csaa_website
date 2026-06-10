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
})
