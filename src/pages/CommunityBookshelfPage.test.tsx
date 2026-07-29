import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../constants/api'
import i18n from '../i18n'
import { downloadPublicFile } from '../lib/fileDownload'
import { CommunityBookshelfPage } from './CommunityBookshelfPage'

const { listBooks } = vi.hoisted(() => ({
  listBooks: vi.fn(),
}))

vi.mock('../api/bookshelfApi', async () => {
  const actual = await vi.importActual<typeof import('../api/bookshelfApi')>('../api/bookshelfApi')

  return {
    ...actual,
    publicBookshelfApi: {
      ...actual.publicBookshelfApi,
      listBooks,
    },
  }
})

vi.mock('../lib/fileDownload', () => ({
  downloadPublicFile: vi.fn(),
}))

describe('CommunityBookshelfPage', () => {
  function renderPage() {
    window.history.pushState({}, '', '/community-circle/bookshelf')

    return render(
      <MemoryRouter initialEntries={['/community-circle/bookshelf']}>
        <CommunityBookshelfPage />
      </MemoryRouter>,
    )
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('en')

    listBooks.mockImplementation(
      async ({
        page,
      }: {
        page: number
      }) => ({
        items: page === 1 ? createBooks(1, 10) : createBooks(11, 11),
        pagination:
          page === 1
            ? {
                page: 1,
                pageSize: 10,
                totalItems: 11,
                totalPages: 2,
                hasNext: true,
                hasPrev: false,
              }
            : {
                page: 2,
                pageSize: 10,
                totalItems: 11,
                totalPages: 2,
                hasNext: false,
                hasPrev: true,
              },
      }),
    )

    vi.mocked(downloadPublicFile).mockResolvedValue(undefined)
  })

  it('loads bookshelf items with show more and opens a richer shared reader modal', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { level: 2, name: /browse the collection/i }),
    ).toBeDefined()
    expect(listBooks).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      searchTerm: '',
    })
    expect(await screen.findByText('11 books')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /show more/i }))

    expect(await screen.findByText('Author 11')).toBeDefined()
    await waitFor(() => {
      expect(listBooks).toHaveBeenLastCalledWith({
        page: 2,
        pageSize: 10,
        searchTerm: '',
      })
    })

    fireEvent.click(screen.getAllByRole('button', { name: /open book: book 1/i })[0])

    const dialog = screen.getByRole('dialog', { name: /book 1/i })
    const frame = within(dialog).getByTitle(/book 1/i)

    expect(frame.getAttribute('src')).toBe(`${API_BASE_URL}/api/bookshelf/1/book/content`)
    expect(within(dialog).getByText(/about this book/i)).toBeDefined()
    expect(within(dialog).getByText(/bio for author 1\./i)).toBeDefined()

    fireEvent.click(within(dialog).getByRole('button', { name: /download book/i }))

    await waitFor(() => {
      expect(downloadPublicFile).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/bookshelf/1/book/content`,
        'book-1.pdf',
      )
    })
  }, 10000)
})

function createBooks(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const id = start + index

    return {
      id: String(id),
      author: `Author ${id}`,
      title: `Book ${id}`,
      bookLink: id === 1 ? 'https://example.com/book-1' : '',
      authorBio: `Bio for author ${id}.`,
      bookTeaser: `Teaser for book ${id}.`,
      description: `Description for book ${id}.`,
      bookFileName: `book-${id}.pdf`,
      bookMimeType: 'application/pdf',
      bookFileSize: 4096,
      bookContentUrl: `${API_BASE_URL}/api/bookshelf/${id}/book/content`,
      hasBookFile: true,
      authorImageFileName: `author-${id}.jpg`,
      authorImageMimeType: 'image/jpeg',
      authorImageFileSize: 1024,
      hasAuthorImage: id === 1,
      authorImageContentUrl: `${API_BASE_URL}/api/bookshelf/${id}/author-image/content`,
      coverImageFileName: `cover-${id}.jpg`,
      coverImageMimeType: 'image/jpeg',
      coverImageFileSize: 2048,
      hasCoverImage: id % 2 === 1,
      coverImageContentUrl: `${API_BASE_URL}/api/bookshelf/${id}/cover/content`,
      createdAt: '2026-07-07T12:00:00Z',
      updatedAt: '2026-07-07T12:00:00Z',
    }
  })
}
