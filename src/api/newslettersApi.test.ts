import { beforeEach, describe, expect, it, vi } from 'vitest'
import { newslettersApi } from './newslettersApi'
import { apiClient } from './apiClient'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

describe('newslettersApi', () => {
  beforeEach(() => {
    apiGet.mockReset()
  })

  it('fetches all published public newsletters and hydrates details', async () => {
    apiGet.mockImplementation(async (url, config) => {
      if (url === '/api/newsletters') {
        expect(config?.skipAuth).toBe(true)
        expect(config?.skipErrorToast).toBe(true)

        if (config?.params.page === 2) {
          return {
            data: {
              items: [
                {
                  id: 2,
                  title: 'Winter Solstice Ceremony',
                  category: 'csaa',
                  send_date: '2025-12-08T00:00:00Z',
                  status: 'published',
                  visibility: 'public',
                  created_at: '',
                  updated_at: '',
                },
              ],
              total: 2,
              page: 2,
              page_size: 100,
              total_pages: 2,
            },
          }
        }

        expect(config?.params).toMatchObject({
          status: 'published',
          visibility: 'public',
          sort_by: 'send_date',
          sort_order: 'desc',
          page: 1,
          page_size: 100,
        })

        return {
          data: {
            items: [
              {
                id: 1,
                title: 'Community Reunion Highlights',
                category: 'csaa',
                send_date: '2026-05-01T00:00:00Z',
                status: 'published',
                visibility: 'public',
                created_at: '',
                updated_at: '',
              },
            ],
            total: 2,
            page: 1,
            page_size: 100,
            total_pages: 2,
          },
        }
      }

      return {
        data:
          url === '/api/newsletters/1'
            ? {
                id: 1,
                title: 'Community Reunion Highlights',
                category: 'csaa',
                send_date: '2026-05-01T00:00:00Z',
                content_html: '<p>Feature story.</p>',
                status: 'published',
                visibility: 'public',
                publish_at: null,
                media: [],
                created_at: '',
                updated_at: '',
              }
            : {
                id: 2,
                title: 'Winter Solstice Ceremony',
                category: 'csaa',
                send_date: '2025-12-08T00:00:00Z',
                content_html: '<p>Archive story.</p>',
                status: 'published',
                visibility: 'public',
                publish_at: null,
                media: [],
                created_at: '',
                updated_at: '',
              },
      }
    })

    const response = await newslettersApi.listPublishedNewsletters()

    expect(response.map((item) => item.title)).toEqual([
      'Community Reunion Highlights',
      'Winter Solstice Ceremony',
    ])
    expect(apiGet).toHaveBeenCalledWith('/api/newsletters/1', {
      skipAuth: true,
      skipErrorToast: true,
    })
    expect(apiGet).toHaveBeenCalledWith('/api/newsletters/2', {
      skipAuth: true,
      skipErrorToast: true,
    })
  })
})
