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

  it('fetches all published public newsletters from the list API only', async () => {
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
                  content_html: '<p>Archive story.</p>',
                  status: 'published',
                  visibility: 'public',
                  publish_at: null,
                  media: [],
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
                content_html: '<p>Feature story.</p>',
                status: 'published',
                visibility: 'public',
                publish_at: null,
                media: [],
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

      throw new Error(`unexpected request: ${String(url)}`)
    })

    const response = await newslettersApi.listPublishedNewsletters()

    expect(response.map((item) => item.title)).toEqual([
      'Community Reunion Highlights',
      'Winter Solstice Ceremony',
    ])
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('normalizes non-array media values from the list and detail APIs', async () => {
    apiGet.mockImplementation(async (url) => {
      if (url === '/api/newsletters') {
        return {
          data: {
            items: [
              {
                id: 1,
                title: 'Community Reunion Highlights',
                category: 'csaa',
                send_date: '2026-05-01T00:00:00Z',
                content_html: '<p>Feature story.</p>',
                status: 'published',
                visibility: 'public',
                publish_at: null,
                media: null,
                created_at: '',
                updated_at: '',
              },
            ],
            total: 1,
            page: 1,
            page_size: 100,
            total_pages: 1,
          },
        }
      }

      if (url === '/api/newsletters/7') {
        return {
          data: {
            id: 7,
            title: 'Special Edition',
            category: 'cst',
            send_date: '2026-04-01T00:00:00Z',
            content_html: '<p>Feature story.</p>',
            status: 'published',
            visibility: 'public',
            publish_at: null,
            media: null,
            created_at: '',
            updated_at: '',
          },
        }
      }

      throw new Error(`unexpected request: ${String(url)}`)
    })

    const [listResponse, detailResponse] = await Promise.all([
      newslettersApi.listPublishedNewsletters(),
      newslettersApi.getNewsletter(7),
    ])

    expect(listResponse[0]?.media).toEqual([])
    expect(detailResponse.media).toEqual([])
  })
})
