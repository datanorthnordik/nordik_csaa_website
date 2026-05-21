import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { PressArchiveDetailPage } from './PressArchiveDetailPage'

const { getPressEntry, downloadPublicFile } = vi.hoisted(() => ({
  getPressEntry: vi.fn(),
  downloadPublicFile: vi.fn(),
}))

vi.mock('../api/pressApi', () => ({
  pressApi: {
    getPressEntry,
  },
}))

vi.mock('../lib/fileDownload', () => ({
  downloadPublicFile,
}))

function renderPage(path = '/news-media/press-archive/31') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/news-media/press-archive/:pressId"
          element={<PressArchiveDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PressArchiveDetailPage', () => {
  beforeEach(async () => {
    getPressEntry.mockReset()
    downloadPublicFile.mockReset()
    await i18n.changeLanguage('en')
  })

  it('renders the archive details, source action, hero image, and supporting documents', async () => {
    getPressEntry.mockResolvedValue({
      id: 31,
      title: 'Archived media statement',
      release_date: '2026-04-15T00:00:00Z',
      category_id: null,
      source_url: 'https://example.com/source',
      content_html: '<p>Full press archive story for the internal detail page.</p>',
      status: 'published',
      visibility: 'public',
      cover_image_url: '/api/press/31/cover/content',
      cover_image_gcp_key: '',
      publish_at: null,
      media: [
        {
          id: 401,
          display_name: 'Archive PDF',
          file_name: 'statement.pdf',
          gcp_object_key: '',
          file_url: '/api/press/31/media/401/content',
          mime_type: 'application/pdf',
          file_size: 100,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      created_at: '',
      updated_at: '',
    })

    renderPage()

    expect(
      await screen.findByRole('heading', { name: /archived media statement/i }),
    ).toBeDefined()
    expect(
      screen.getByText(/full press archive story for the internal detail page/i),
    ).toBeDefined()
    expect(screen.getByRole('img', { name: /archived media statement/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /open original source/i })).toBeDefined()
    expect(
      screen.getByRole('heading', { name: /archive documents/i }),
    ).toBeDefined()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeDefined()
  })

  it('omits filler description copy when no content is available', async () => {
    getPressEntry.mockResolvedValue({
      id: 32,
      title: 'Archive without description',
      release_date: '2026-01-10T00:00:00Z',
      category_id: null,
      source_url: '',
      content_html: '',
      status: 'published',
      visibility: 'public',
      cover_image_url: '',
      cover_image_gcp_key: '',
      publish_at: null,
      media: [],
      created_at: '',
      updated_at: '',
    })

    renderPage('/news-media/press-archive/32')

    expect(
      await screen.findByRole('heading', { name: /archive without description/i }),
    ).toBeDefined()
    expect(
      screen.queryByText(/full archive details will appear here when they are added in the cms\./i),
    ).toBeNull()
    expect(screen.queryByRole('heading', { name: /archive documents/i })).toBeNull()
  })

  it('shows the error state for an invalid archive id', async () => {
    renderPage('/news-media/press-archive/not-a-number')

    expect(
      await screen.findByRole('heading', {
        name: /this press archive entry is unavailable right now/i,
      }),
    ).toBeDefined()
    expect(getPressEntry).not.toHaveBeenCalled()
  })
})
