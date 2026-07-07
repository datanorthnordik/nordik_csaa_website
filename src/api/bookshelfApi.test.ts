import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../constants/api'
import {
  publicBookshelfApiEntryToLocal,
  resolvePublicBookshelfContentUrl,
  type PublicBookshelfApiEntry,
} from './bookshelfApi'

function createApiEntry(
  overrides: Partial<PublicBookshelfApiEntry> = {},
): PublicBookshelfApiEntry {
  return {
    id: 3,
    author: 'Alice Archive',
    title: 'Stories from the Circle',
    book_link: 'https://example.com/stories',
    author_bio: 'A community historian and storyteller.',
    book_teaser: 'A collection of stories and reflections.',
    description: 'Expanded background about the title.',
    book_file_name: 'stories-from-the-circle.pdf',
    book_mime_type: 'application/pdf',
    book_file_size: 2048,
    book_content_url: '/api/bookshelf/3/book/content',
    author_image_file_name: 'alice.jpg',
    author_image_mime_type: 'image/jpeg',
    author_image_file_size: 1024,
    has_author_image: true,
    author_image_content_url: '/api/bookshelf/3/author-image/content',
    cover_image_file_name: 'stories-cover.jpg',
    cover_image_mime_type: 'image/jpeg',
    cover_image_file_size: 4096,
    has_cover_image: true,
    cover_image_content_url: '/api/bookshelf/3/cover/content',
    created_at: '2026-07-07T12:00:00Z',
    updated_at: '2026-07-07T12:00:00Z',
    ...overrides,
  }
}

describe('bookshelfApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('maps bookshelf entries to local data and resolves asset urls', () => {
    const entry = publicBookshelfApiEntryToLocal(createApiEntry())

    expect(entry.id).toBe('3')
    expect(entry.bookContentUrl).toBe(`${API_BASE_URL}/api/bookshelf/3/book/content`)
    expect(entry.authorImageContentUrl).toBe(
      `${API_BASE_URL}/api/bookshelf/3/author-image/content`,
    )
    expect(entry.coverImageContentUrl).toBe(
      `${API_BASE_URL}/api/bookshelf/3/cover/content`,
    )
  })

  it('falls back to a stable public book content url when the api omits one', () => {
    expect(resolvePublicBookshelfContentUrl({ id: 9, contentUrl: '' })).toBe(
      `${API_BASE_URL}/api/bookshelf/9/book/content`,
    )
  })

  it('keeps missing optional image urls blank when those assets do not exist', () => {
    const entry = publicBookshelfApiEntryToLocal(
      createApiEntry({
        has_author_image: false,
        author_image_content_url: '',
        has_cover_image: false,
        cover_image_content_url: '',
      }),
    )

    expect(entry.authorImageContentUrl).toBe('')
    expect(entry.coverImageContentUrl).toBe('')
  })
})
