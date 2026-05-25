import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pressApi } from './pressApi'
import { apiClient } from './apiClient'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

describe('pressApi', () => {
  beforeEach(() => {
    apiGet.mockReset()
  })

  it('fetches all published public press entries from the list API only', async () => {
    apiGet.mockImplementation(async (url, config) => {
      if (url === '/api/press') {
        expect(config?.skipAuth).toBe(true)
        expect(config?.skipErrorToast).toBe(true)

        if (config?.params.page === 2) {
          return {
            data: {
              items: [
                {
                  id: 2,
                  title: 'Winter Coverage',
                  release_date: '2025-12-08T00:00:00Z',
                  category_id: null,
                  source_url: '',
                  content_html: '<p>Archive story.</p>',
                  status: 'published',
                  visibility: 'public',
                  cover_image_url: '',
                  cover_image_gcp_key: '',
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
          sort_by: 'release_date',
          sort_order: 'desc',
          page: 1,
          page_size: 100,
        })

        return {
          data: {
            items: [
              {
                id: 1,
                title: 'Community Press Release',
                release_date: '2026-05-01T00:00:00Z',
                category_id: null,
                source_url: 'https://example.com/source-one',
                content_html: '<p>Feature story.</p>',
                status: 'published',
                visibility: 'public',
                cover_image_url: '',
                cover_image_gcp_key: '',
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

    const response = await pressApi.listPublishedPressEntries()

    expect(response.map((item) => item.title)).toEqual([
      'Community Press Release',
      'Winter Coverage',
    ])
    expect(apiGet).toHaveBeenCalledTimes(2)
  })
})
