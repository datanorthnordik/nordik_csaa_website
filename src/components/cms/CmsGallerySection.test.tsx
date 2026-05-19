import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { galleriesApi } from '../../api/galleriesApi'
import type { PageSection } from '../../api/pagesApi'
import { CmsGallerySection } from './CmsGallerySection'

vi.mock('../../api/galleriesApi', () => ({
  galleriesApi: {
    getGallery: vi.fn(),
  },
}))

const getGallery = vi.mocked(galleriesApi.getGallery)

function createSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 15,
    section_name: 'Gallery Module',
    section_type: 'gallery',
    sort_order: 2,
    is_enabled: true,
    settings: {},
    gallery: {
      gallery_id: 5,
      view_mode: 'grid',
    },
    ...overrides,
  }
}

describe('CmsGallerySection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    getGallery.mockReset()
  })

  it('loads gallery details and renders the selected layout', async () => {
    getGallery.mockResolvedValue({
      id: 5,
      name: 'Community portraits',
      description: 'Portraits and exhibit images from the community archive.',
      published: true,
      asset_limit: 20,
      cover_image: null,
      images: [
        {
          id: 1,
          gallery_id: 5,
          title: 'Fran Fletcher-Luther',
          alt_text: 'Portrait of Fran Fletcher-Luther',
          file_name: 'fran.jpg',
          file_url: '/api/galleries/5/images/1/content',
          mime_type: 'image/jpeg',
          file_size: 0,
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      created_at: '',
      updated_at: '',
    })

    render(<CmsGallerySection section={createSection()} />)

    expect(await screen.findByRole('heading', { name: /community portraits/i })).toBeDefined()
    expect(getGallery).toHaveBeenCalledWith(5)
    expect(
      screen.getByText(/portraits and exhibit images from the community archive\./i),
    ).toBeDefined()
    expect(screen.getByText(/1 image/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /fran fletcher-luther/i })).toBeDefined()
  })

  it('shows a graceful error state when the gallery cannot be loaded', async () => {
    getGallery.mockRejectedValue(new Error('service unavailable'))

    render(<CmsGallerySection section={createSection()} />)

    expect(
      await screen.findByText(/we could not load this gallery right now\./i),
    ).toBeDefined()
  })
})
