import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './apiClient'
import { booksApi } from './booksApi'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const apiPost = vi.mocked(apiClient.post)

describe('booksApi', () => {
  beforeEach(() => {
    apiPost.mockReset()
    apiPost.mockResolvedValue({
      data: {
        submission: {
          id: 9,
          status: 'pending',
          updated_at: '2026-06-17T12:00:00Z',
        },
      },
    })
  })

  it('submits plain JSON when no image is selected', async () => {
    await booksApi.submitToBook(
      4,
      {
        targetSectionId: 7,
        newSectionName: '',
        fieldValues: [
          { fieldId: 1, value: 'Athul' },
          { fieldId: 5, value: '<li>4 cups flour</li>' },
        ],
      },
      null,
    )

    expect(apiPost).toHaveBeenCalledWith(
      '/api/books/public/4/submissions',
      {
        target_section_id: 7,
        new_section_name: '',
        field_values: [
          { field_id: 1, value: 'Athul' },
          { field_id: 5, value: '<li>4 cups flour</li>' },
        ],
        image: undefined,
      },
      {
        skipAuth: true,
        skipErrorToast: true,
      },
    )
  })

  it('submits multipart form data when an image is selected', async () => {
    const imageFile = new File(['image-bytes'], 'bannock.png', {
      type: 'image/png',
    })

    await booksApi.submitToBook(
      4,
      {
        targetSectionId: 7,
        newSectionName: '',
        fieldValues: [{ fieldId: 1, value: 'Athul' }],
      },
      imageFile,
    )

    const [, requestBody, config] = apiPost.mock.calls[0] ?? []
    expect(requestBody).toBeInstanceOf(FormData)
    expect(config).toEqual({
      skipAuth: true,
      skipErrorToast: true,
    })

    const form = requestBody as FormData
    const uploadedFile = form.get('image_file')
    expect(uploadedFile).toBeInstanceOf(File)
    expect((uploadedFile as File).name).toBe('bannock.png')
    expect((uploadedFile as File).type).toBe('image/png')
    expect((uploadedFile as File).size).toBe(imageFile.size)
    expect(form.get('payload')).toBe(
      JSON.stringify({
        target_section_id: 7,
        new_section_name: '',
        field_values: [{ field_id: 1, value: 'Athul' }],
        image: {
          file_name: 'bannock.png',
          mime_type: 'image/png',
          file_size: imageFile.size,
        },
      }),
    )
  })
})
