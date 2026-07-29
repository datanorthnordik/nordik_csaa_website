import { describe, expect, it } from 'vitest'
import { getBookshelfDestination } from './bookshelfNavigation'

describe('getBookshelfDestination', () => {
  it('opens an uploaded book in the Living History flipbook reader', () => {
    expect(
      getBookshelfDestination({
        id: '42',
        hasBookFile: true,
        bookLink: 'https://example.com/fallback',
      }),
    ).toEqual({
      kind: 'reader',
      href: '/living-history-hub/books/42',
    })
  })

  it('redirects to the configured link when no book was uploaded', () => {
    expect(
      getBookshelfDestination({
        id: '7',
        hasBookFile: false,
        bookLink: 'https://example.com/book',
      }),
    ).toEqual({
      kind: 'external',
      href: 'https://example.com/book',
    })
  })

  it('does not offer an action when neither a file nor link is available', () => {
    expect(
      getBookshelfDestination({
        id: '8',
        hasBookFile: false,
        bookLink: '   ',
      }),
    ).toBeNull()
  })
})
