import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { PressArchivePage } from './PressArchivePage'

const { listPublishedPressEntries, downloadPublicFile } = vi.hoisted(() => ({
  listPublishedPressEntries: vi.fn(),
  downloadPublicFile: vi.fn(),
}))

vi.mock('../api/pressApi', () => ({
  pressApi: {
    listPublishedPressEntries,
  },
}))

vi.mock('../lib/fileDownload', () => ({
  downloadPublicFile,
}))

const sampleEntries = [
  {
    id: 91,
    title: 'Community coverage feature',
    release_date: '2026-05-02T00:00:00Z',
    category_id: null,
    source_url: 'https://example.com/coverage-story',
    content_html: '<p>Community media coverage with interviews and archive updates.</p>',
    status: 'published',
    visibility: 'public',
    cover_image_url: '/api/press/91/cover/content',
    cover_image_gcp_key: '',
    publish_at: null,
    media: [
      {
        id: 901,
        display_name: 'Press PDF',
        file_name: 'coverage.pdf',
        gcp_object_key: '',
        file_url: '/api/press/91/media/901/content',
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
  },
  {
    id: 92,
    title: 'Archived internal release',
    release_date: '2025-04-10T00:00:00Z',
    category_id: null,
    source_url: '',
    content_html: '<p>Archived internal release with supporting files and notes.</p>',
    status: 'published',
    visibility: 'public',
    cover_image_url: '',
    cover_image_gcp_key: '',
    publish_at: null,
    media: [
      {
        id: 902,
        display_name: 'Archive HTML',
        file_name: 'release.html',
        gcp_object_key: '',
        file_url: '/api/press/92/media/902/content',
        mime_type: 'text/html',
        file_size: 100,
        media_role: 'attachment',
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
      {
        id: 903,
        display_name: 'Archive PDF',
        file_name: 'release.pdf',
        gcp_object_key: '',
        file_url: '/api/press/92/media/903/content',
        mime_type: 'application/pdf',
        file_size: 100,
        media_role: 'attachment',
        sort_order: 1,
        created_at: '',
        updated_at: '',
      },
    ],
    created_at: '',
    updated_at: '',
  },
  {
    id: 93,
    title: 'Historic statement',
    release_date: '2021-11-08T00:00:00Z',
    category_id: null,
    source_url: '',
    content_html: '<p>Historic statement for older archive filtering.</p>',
    status: 'published',
    visibility: 'public',
    cover_image_url: '',
    cover_image_gcp_key: '',
    publish_at: null,
    media: [],
    created_at: '',
    updated_at: '',
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <PressArchivePage />
    </MemoryRouter>,
  )
}

describe('PressArchivePage', () => {
  beforeEach(async () => {
    listPublishedPressEntries.mockReset()
    downloadPublicFile.mockReset()
    await i18n.changeLanguage('en')
  })

  it('renders external and internal archive entries with fixed previews and generic download actions', async () => {
    listPublishedPressEntries.mockResolvedValue(sampleEntries)
    downloadPublicFile.mockResolvedValue(undefined)

    renderPage()

    expect(await screen.findByRole('heading', { name: /press archive/i })).toBeDefined()
    expect(
      screen.getByText(/explore public coverage, archived articles, and press materials/i),
    ).toBeDefined()
    expect(screen.queryByTitle(/preview for archived internal release/i)).toBeNull()
    expect(screen.getAllByText(/archives? de presse|press archive/i).length).toBeGreaterThan(0)

    const externalLink = screen.getByRole('link', {
      name: /community coverage feature open source/i,
    })
    expect(externalLink.getAttribute('href')).toBe('https://example.com/coverage-story')
    expect(externalLink.getAttribute('target')).toBe('_blank')

    const internalLink = screen.getByRole('link', {
      name: /archived internal release read archive/i,
    })
    expect(internalLink.getAttribute('href')).toBe('/news-media/press-archive/92')
    expect(internalLink.getAttribute('target')).toBe('_blank')

    fireEvent.click(screen.getByRole('button', { name: /download document archive pdf/i }))

    await waitFor(() => {
      expect(downloadPublicFile).toHaveBeenCalledWith(
        expect.stringContaining('/api/press/92/media/903/content'),
        'release.pdf',
      )
    })
  })

  it('filters entries by featured years, custom year, and search term', async () => {
    listPublishedPressEntries.mockResolvedValue(sampleEntries)

    renderPage()
    await screen.findByRole('heading', { name: /press archive/i })

    fireEvent.click(screen.getByRole('button', { name: '2025' }))
    expect(screen.getByRole('heading', { name: /archived internal release/i })).toBeDefined()
    expect(screen.queryByRole('heading', { name: /community coverage feature/i })).toBeNull()

    fireEvent.change(screen.getByLabelText(/filter by an older year/i), {
      target: { value: '2021' },
    })
    expect(screen.getByRole('heading', { name: /historic statement/i })).toBeDefined()
    expect(screen.queryByRole('heading', { name: /archived internal release/i })).toBeNull()

    fireEvent.change(screen.getByRole('searchbox', { name: /search press archive/i }), {
      target: { value: 'coverage' },
    })
    expect(screen.getByText(/no press archive entries matched this view/i)).toBeDefined()
  })

  it('shows the error state when press archive entries cannot be loaded', async () => {
    listPublishedPressEntries.mockRejectedValue(new Error('boom'))

    renderPage()

    expect(
      await screen.findByText(/we could not load press archive entries right now\./i),
    ).toBeDefined()
  })
})
