import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { DigitalNewslettersPage } from './DigitalNewslettersPage'

const { listPublishedNewsletters } = vi.hoisted(() => ({
  listPublishedNewsletters: vi.fn(),
}))

vi.mock('../api/newslettersApi', () => ({
  newslettersApi: {
    listPublishedNewsletters,
  },
}))

const sampleEntries = [
  {
    id: 11,
    title: 'Community Reunion Highlights',
    category: 'csaa',
    send_date: '2026-05-01T00:00:00Z',
    content_html: '<p>Revisiting reunion stories from across the community.</p>',
    status: 'published',
    visibility: 'public',
    publish_at: null,
    created_at: '',
    updated_at: '',
    media: [
      {
        id: 201,
        display_name: 'Display image',
        file_name: 'reunion.jpg',
        gcp_object_key: '',
        file_url: '/api/newsletters/11/media/201/content',
        mime_type: 'image/jpeg',
        file_size: 1024,
        media_role: 'attachment',
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
      {
        id: 202,
        display_name: 'Edition PDF',
        file_name: 'reunion.pdf',
        gcp_object_key: '',
        file_url: '/api/newsletters/11/media/202/content',
        mime_type: 'application/pdf',
        file_size: 2048,
        media_role: 'attachment',
        sort_order: 1,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: 12,
    title: 'Archival Digitization Milestones',
    category: 'cst',
    send_date: '2025-11-15T00:00:00Z',
    content_html: '<p>Digitization updates and collection notes.</p>',
    status: 'published',
    visibility: 'public',
    publish_at: null,
    created_at: '',
    updated_at: '',
    media: [
      {
        id: 301,
        display_name: 'Edition PDF',
        file_name: 'digitization.pdf',
        gcp_object_key: '',
        file_url: '/api/newsletters/12/media/301/content',
        mime_type: 'application/pdf',
        file_size: 2048,
        media_role: 'attachment',
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: 13,
    title: 'The Winter Solstice Ceremony',
    category: 'csaa',
    send_date: '2024-12-10T00:00:00Z',
    content_html: '<p>Seasonal updates from the support team.</p>',
    status: 'published',
    visibility: 'public',
    publish_at: null,
    created_at: '',
    updated_at: '',
    media: [],
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <DigitalNewslettersPage />
    </MemoryRouter>,
  )
}

describe('DigitalNewslettersPage', () => {
  beforeEach(async () => {
    listPublishedNewsletters.mockReset()
    await i18n.changeLanguage('en')
  })

  it('renders the latest feature, uses image previews first, and routes editions to the detail page', async () => {
    listPublishedNewsletters.mockResolvedValue(sampleEntries)

    renderPage()

    expect(
      await screen.findByRole('heading', { name: /digital newsletters/i }),
    ).toBeDefined()
    expect(
      screen.getByText(/stay up-to-date with the latest news, updates, and community initiatives/i),
    ).toBeDefined()
    expect(
      screen.getAllByText(/latest edition/i).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByTitle(/preview for archival digitization milestones/i),
    ).toBeDefined()

    const link = screen.getByRole('link', {
      name: /read community reunion highlights details/i,
    })
    expect(link.getAttribute('href')).toBe('/news-media/digital-newsletter/11')
    expect(link.getAttribute('target')).toBeNull()
  })

  it('filters list results by year and search term', async () => {
    listPublishedNewsletters.mockResolvedValue(sampleEntries)

    renderPage()

    await screen.findByRole('heading', { name: /digital newsletters/i })

    fireEvent.click(screen.getByRole('button', { name: '2024' }))

    expect(
      screen.getByRole('heading', { name: /the winter solstice ceremony/i }),
    ).toBeDefined()
    expect(
      screen.queryByRole('heading', { name: /archival digitization milestones/i }),
    ).toBeNull()

    fireEvent.change(screen.getByRole('searchbox', { name: /search newsletters/i }), {
      target: { value: 'digitization' },
    })

    expect(screen.getByText(/no newsletters matched this view/i)).toBeDefined()
  })

  it('shows an error state when newsletters cannot be loaded', async () => {
    listPublishedNewsletters.mockRejectedValue(new Error('boom'))

    renderPage()

    expect(
      await screen.findByText(/we could not load digital newsletters right now\./i),
    ).toBeDefined()
  })
})
