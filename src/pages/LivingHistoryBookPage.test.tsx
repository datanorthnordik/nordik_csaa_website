import { render, screen, within } from '@testing-library/react'
import { useCallback, useState, type ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { publicBookshelfApi } from '../api/bookshelfApi'
import {
  BreadcrumbOverrideProvider,
  SiteBreadcrumbs,
} from '../components/SiteBreadcrumbs'
import type { BreadcrumbItem } from '../lib/breadcrumbs'
import { LivingHistoryBookPage } from './LivingHistoryBookPage'

vi.mock('../api/bookshelfApi', () => ({
  publicBookshelfApi: {
    getBook: vi.fn(),
  },
}))

vi.mock('../components/flipbook/DocumentFlipbook', () => ({
  DocumentFlipbook: ({
    title,
    theme,
  }: {
    title: string
    theme?: string
  }) => <p>Flipbook for {title} using {theme}</p>,
}))

const getBook = vi.mocked(publicBookshelfApi.getBook)

function BreadcrumbHarness({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([])
  const updateItems = useCallback(
    (nextItems: BreadcrumbItem[] | null) => {
      const next = nextItems ?? []
      setItems((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next,
      )
    },
    [],
  )

  return (
    <BreadcrumbOverrideProvider onItemsChange={updateItems}>
      <SiteBreadcrumbs items={items} />
      {children}
    </BreadcrumbOverrideProvider>
  )
}

describe('LivingHistoryBookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getBook.mockResolvedValue({
      id: '42',
      author: 'Alice Archive',
      title: 'Shingwauk Memories',
      bookLink: 'https://example.com/book',
      authorBio: 'Community historian.',
      bookTeaser: 'Stories carried forward.',
      description: 'Stories carried forward.',
      bookFileName: 'shingwauk-memories.pdf',
      bookMimeType: 'application/pdf',
      bookFileSize: 4096,
      bookContentUrl: '/api/bookshelf/42/book/content',
      hasBookFile: true,
      authorImageFileName: '',
      authorImageMimeType: '',
      authorImageFileSize: 0,
      hasAuthorImage: false,
      authorImageContentUrl: '',
      coverImageFileName: 'cover.jpg',
      coverImageMimeType: 'image/jpeg',
      coverImageFileSize: 1024,
      hasCoverImage: true,
      coverImageContentUrl: '/api/bookshelf/42/cover/content',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
    })
  })

  it('loads the selected book and provides a breadcrumb trail back to the hub', async () => {
    render(
      <MemoryRouter initialEntries={['/living-history-hub/books/42']}>
        <BreadcrumbHarness>
          <Routes>
            <Route path="/living-history-hub/books/:bookId" element={<LivingHistoryBookPage />} />
          </Routes>
        </BreadcrumbHarness>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Shingwauk Memories' })).toBeDefined()
    expect(getBook).toHaveBeenCalledWith('42')
    expect(screen.getByText('Flipbook for Shingwauk Memories using cookbook')).toBeDefined()
    expect(screen.getByRole('link', { name: /back to the hub/i }).getAttribute('href')).toBe(
      '/living-history-hub',
    )

    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(screen.getByRole('link', { name: 'Living History Hub' }).getAttribute('href')).toBe(
      '/living-history-hub',
    )
    expect(await within(breadcrumb).findByText('Shingwauk Memories')).toBeDefined()
  })
})
