import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { DigitalNewsletterDetailPage } from './DigitalNewsletterDetailPage'

const { getNewsletter, downloadPublicFile } = vi.hoisted(() => ({
  getNewsletter: vi.fn(),
  downloadPublicFile: vi.fn(),
}))

vi.mock('../api/newslettersApi', () => ({
  newslettersApi: {
    getNewsletter,
  },
}))

vi.mock('../lib/fileDownload', () => ({
  downloadPublicFile,
}))

vi.mock('../components/newsletters/NewsletterFlipbook', () => ({
  NewsletterFlipbook: ({
    source,
    title,
  }: {
    source: { kind: 'pdf' | 'images' }
    title: string
  }) => (
    <div>
      Flipbook for {title} ({source.kind})
    </div>
  ),
}))

function renderPage(path = '/news-media/digital-newsletter/24') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/news-media/digital-newsletter/:newsletterId"
          element={<DigitalNewsletterDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DigitalNewsletterDetailPage', () => {
  beforeEach(async () => {
    getNewsletter.mockReset()
    downloadPublicFile.mockReset()
    await i18n.changeLanguage('en')
  })

  it('renders heading, category, description, and downloads the edition when newsletter media can be flipped', async () => {
    getNewsletter.mockResolvedValue({
      id: 24,
      title: 'Dr. Shirley Horn Convocation - June 2025',
      category: 'cst',
      send_date: '2025-06-15T00:00:00Z',
      content_html:
        '<p>In this special edition, the Community Support Team proudly celebrates a historic milestone.</p>',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [
        {
          id: 601,
          display_name: 'Cover image',
          file_name: 'cover.jpg',
          gcp_object_key: '',
          file_url: '/api/newsletters/24/media/601/content',
          mime_type: 'image/jpeg',
          file_size: 1024,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
        {
          id: 602,
          display_name: 'Edition PDF',
          file_name: 'convocation.pdf',
          gcp_object_key: '',
          file_url: '/api/newsletters/24/media/602/content',
          mime_type: 'application/pdf',
          file_size: 2048,
          media_role: 'attachment',
          sort_order: 1,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    renderPage()

    expect(
      await screen.findByRole('heading', {
        name: /dr\. shirley horn convocation - june 2025/i,
      }),
    ).toBeDefined()
    expect(screen.getByText(/^cst$/i)).toBeDefined()
    expect(
      screen.getByText(/community support team proudly celebrates a historic milestone/i),
    ).toBeDefined()
    expect(
      screen.getByText(/flipbook for dr\. shirley horn convocation - june 2025 \(pdf\)/i),
    ).toBeDefined()
    expect(screen.getByRole('button', { name: /download edition/i })).toBeDefined()

    downloadPublicFile.mockResolvedValue(undefined)
    fireEvent.click(screen.getByRole('button', { name: /download edition/i }))

    await waitFor(() => {
      expect(downloadPublicFile).toHaveBeenCalledWith(
        expect.stringContaining('/api/newsletters/24/media/602/content'),
        'convocation.pdf',
      )
    })
  })

  it('shows the newsletter details without a flipbook when no previewable media exists', async () => {
    getNewsletter.mockResolvedValue({
      id: 25,
      title: 'Community Support Update',
      category: 'cst',
      send_date: '2025-07-01T00:00:00Z',
      content_html: '',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [],
    })

    renderPage('/news-media/digital-newsletter/25')

    expect(
      await screen.findByRole('heading', { name: /community support update/i }),
    ).toBeDefined()
    expect(
      screen.getByText(/a full description for this edition will appear here when it is added in the cms\./i),
    ).toBeDefined()
    expect(screen.queryByText(/flipbook for community support update/i)).toBeNull()
  })

  it('shows the error state for an invalid newsletter id', async () => {
    renderPage('/news-media/digital-newsletter/not-a-number')

    expect(
      await screen.findByRole('heading', {
        name: /this newsletter is unavailable right now/i,
      }),
    ).toBeDefined()
    expect(getNewsletter).not.toHaveBeenCalled()
  })
})
