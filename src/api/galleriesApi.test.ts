import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './apiClient'
import { galleriesApi } from './galleriesApi'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

describe('galleriesApi', () => {
  beforeEach(() => {
    apiGet.mockReset()
  })

  it('fetches gallery details without auth', async () => {
    apiGet.mockResolvedValue({
      data: {
        id: 5,
        name: 'Community portraits',
        description: 'Portraits from the archive.',
        images: [],
      },
    })

    const response = await galleriesApi.getGallery(5)

    expect(apiGet).toHaveBeenCalledWith('/api/galleries/5', {
      skipAuth: true,
      skipErrorToast: true,
    })
    expect(response).toEqual({
      id: 5,
      name: 'Community portraits',
      description: 'Portraits from the archive.',
      images: [],
    })
  })
})
