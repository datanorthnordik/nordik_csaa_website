import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './apiClient'
import {
  LIVING_HISTORY_RECORDINGS_PLACEMENT_KEY,
  recordingsApi,
} from './recordingsApi'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

describe('recordingsApi', () => {
  beforeEach(() => {
    apiGet.mockReset()
  })

  it('fetches public recording collections without auth', async () => {
    const response = {
      items: [
        {
          id: 7,
          name: 'Community Gatherings',
          item_count: 1,
          created_at: '2026-09-20T10:00:00Z',
          updated_at: '2026-09-20T10:00:00Z',
        },
      ],
    }
    apiGet.mockResolvedValue({ data: response })

    await expect(recordingsApi.listCollections()).resolves.toEqual(response)
    expect(apiGet).toHaveBeenCalledWith('/api/recordings', {
      skipAuth: true,
      skipErrorToast: true,
    })
  })

  it('fetches a public collection and its title-only recording items', async () => {
    const response = {
      id: 7,
      name: 'Community Gatherings',
      item_count: 1,
      items: [
        {
          id: 11,
          recording_collection_id: 7,
          title: 'September gathering',
          description: 'The recording will be added later.',
          recording_url: '',
          sort_order: 0,
          created_at: '2026-09-20T10:00:00Z',
          updated_at: '2026-09-20T10:00:00Z',
        },
      ],
      created_at: '2026-09-20T10:00:00Z',
      updated_at: '2026-09-20T10:00:00Z',
    }
    apiGet.mockResolvedValue({ data: response })

    await expect(recordingsApi.getCollection(7)).resolves.toEqual(response)
    expect(apiGet).toHaveBeenCalledWith('/api/recordings/7', {
      skipAuth: true,
      skipErrorToast: true,
    })
  })

  it('fetches the Living History collection by its stable placement key', async () => {
    const response = {
      id: 8,
      name: 'Living History Recordings',
      placement_key: LIVING_HISTORY_RECORDINGS_PLACEMENT_KEY,
      item_count: 0,
      items: [],
      created_at: '2026-09-22T10:00:00Z',
      updated_at: '2026-09-22T10:00:00Z',
    }
    apiGet.mockResolvedValue({ data: response })

    await expect(
      recordingsApi.getCollectionByPlacementKey(
        LIVING_HISTORY_RECORDINGS_PLACEMENT_KEY,
      ),
    ).resolves.toEqual(response)
    expect(apiGet).toHaveBeenCalledWith(
      '/api/recordings/placement/living-history-recordings',
      { skipAuth: true, skipErrorToast: true },
    )
  })
})
