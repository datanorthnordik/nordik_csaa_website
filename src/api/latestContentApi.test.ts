import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './apiClient'
import { latestContentApi, mapLatestContentItem } from './latestContentApi'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

describe('latestContentApi', () => {
  beforeEach(() => {
    apiGet.mockReset()
  })

  it('requests only the homepage limit and maps snake case fields', async () => {
    apiGet.mockResolvedValue({
      data: {
        items: [
          {
            id: 1,
            source_type: 'event',
            source_id: 42,
            title: 'Traditional Storytelling Circle',
            description: 'Join us for an evening of oral traditions.',
            display_date: '2026-10-24T00:00:00Z',
            published_at: '2026-09-25T10:00:00Z',
            detail_path: '/events/42',
          },
        ],
      },
    })

    const result = await latestContentApi.listLatestContent(3)

    expect(apiGet).toHaveBeenCalledWith('/api/latest-content', {
      params: { limit: 3 },
      skipAuth: true,
      skipErrorToast: true,
    })
    expect(result[0]).toEqual({
      id: 1,
      sourceType: 'event',
      sourceId: 42,
      title: 'Traditional Storytelling Circle',
      description: 'Join us for an evening of oral traditions.',
      displayDate: '2026-10-24T00:00:00Z',
      publishedAt: '2026-09-25T10:00:00Z',
      detailPath: '/events/42',
    })
  })

  it('normalizes a null item list to an empty array', async () => {
    apiGet.mockResolvedValue({ data: { items: null } })
    expect(await latestContentApi.listLatestContent()).toEqual([])
  })

  it('maps an API item directly', () => {
    expect(
      mapLatestContentItem({
        id: 2,
        source_type: 'press',
        source_id: 8,
        title: 'Media statement',
        description: '',
        display_date: '2026-09-24T00:00:00Z',
        published_at: '2026-09-25T00:00:00Z',
        detail_path: '/news-media/press-archive/8',
      }).sourceType,
    ).toBe('press')
  })
})
