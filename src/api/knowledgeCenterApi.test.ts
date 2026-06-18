import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './apiClient'
import { knowledgeCenterApi } from './knowledgeCenterApi'

vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const apiPost = vi.mocked(apiClient.post)

describe('knowledgeCenterApi', () => {
  beforeEach(() => {
    apiPost.mockReset()
    apiPost.mockResolvedValue({
      data: {
        submission: {
          id: 12,
          submitter_name: 'Alice',
          submitter_email: 'alice@example.com',
          submitter_phone: '',
          submission_type: 'post',
          message: 'I have a story to share.',
          status: 'open',
          completion_notes: '',
          created_at: '2026-06-18T12:00:00Z',
          updated_at: '2026-06-18T12:00:00Z',
        },
      },
    })
  })

  it('submits the Living History contribution as public JSON', async () => {
    await knowledgeCenterApi.submitContribution({
      name: 'Alice',
      email: 'alice@example.com',
      phone: '555-0100',
      type: 'both',
      message: 'I have a story and video to share.',
    })

    expect(apiPost).toHaveBeenCalledWith(
      '/api/knowledge-center/submissions',
      {
        name: 'Alice',
        email: 'alice@example.com',
        phone: '555-0100',
        type: 'both',
        message: 'I have a story and video to share.',
      },
      {
        skipAuth: true,
        skipErrorToast: true,
      },
    )
  })
})
