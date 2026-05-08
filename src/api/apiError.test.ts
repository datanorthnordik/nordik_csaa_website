import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './apiError'

describe('getApiErrorMessage', () => {
  it('formats nested API validation details', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed',
      response: {
        data: {
          error: {
            message: 'Validation failed',
            details: [{ message: 'Title is required' }, { message: 'Slug is required' }],
          },
        },
      },
    }

    expect(getApiErrorMessage(error)).toBe(
      'Validation failed: Title is required, Slug is required',
    )
  })

  it('falls back to the Error message for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('Plain failure'))).toBe('Plain failure')
  })
})
