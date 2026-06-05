import { act, render, screen, waitFor } from '@testing-library/react'
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

    expect(
      await screen.findByRole('button', { name: /fran fletcher-luther/i }),
    ).toBeDefined()
    expect(getGallery).toHaveBeenCalledWith(5)
    const image = screen.getByAltText(/portrait of fran fletcher-luther/i)
    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.getAttribute('decoding')).toBe('async')
    expect(image.getAttribute('fetchpriority')).toBe('low')
    expect(screen.queryByRole('heading', { name: /community portraits/i })).toBeNull()
    expect(
      screen.queryByText(/portraits and exhibit images from the community archive\./i),
    ).toBeNull()
  })

  it('hides gallery image captions when the section disables title and description display', async () => {
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

    render(
      <CmsGallerySection
        section={createSection({
          gallery: {
            gallery_id: 5,
            view_mode: 'grid',
            show_title_description: false,
          },
        })}
      />,
    )

    await screen.findByRole('button', { name: /fran fletcher-luther/i })

    expect(screen.queryByText(/fran fletcher-luther/i)).toBeNull()
  })

  it('shows a graceful error state when the gallery cannot be loaded', async () => {
    getGallery.mockRejectedValue(new Error('service unavailable'))

    render(<CmsGallerySection section={createSection()} />)

    expect(
      await screen.findByText(/we could not load this gallery right now\./i),
    ).toBeDefined()
  })

  it('renders nothing when the gallery is empty instead of filler placeholder copy', async () => {
    getGallery.mockResolvedValue({
      id: 5,
      name: 'Empty gallery',
      description: '',
      published: true,
      asset_limit: 20,
      cover_image: null,
      images: [],
      created_at: '',
      updated_at: '',
    })

    const { container } = render(<CmsGallerySection section={createSection()} />)

    await waitFor(() => {
      expect(
        screen.queryByText(/gallery images will appear here as soon as they are added in the cms\./i),
      ).toBeNull()
      expect(container.firstChild).toBeNull()
    })
  })

  it('renders icon galleries as links and does not mount the lightbox', async () => {
    getGallery.mockResolvedValue({
      id: 5,
      name: 'Partner logos',
      description: '',
      published: true,
      asset_limit: 20,
      cover_image: null,
      images: [
        {
          id: 1,
          gallery_id: 5,
          title: 'Jays Care Foundation',
          alt_text: 'Jays Care Foundation logo',
          link_url: 'https://www.mlb.com/bluejays/community/jays-care',
          file_name: 'jays-care.png',
          file_url: '/api/galleries/5/images/1/content',
          mime_type: 'image/png',
          file_size: 0,
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      created_at: '',
      updated_at: '',
    })

    render(
      <CmsGallerySection
        section={createSection({
          gallery: {
            gallery_id: 5,
            view_mode: 'icons',
          },
        })}
      />,
    )

    const link = await screen.findByRole('link', { name: /jays care foundation/i })

    expect(link.getAttribute('href')).toBe('https://www.mlb.com/bluejays/community/jays-care')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('waits until the gallery nears the viewport before fetching when intersection observers are available', async () => {
    const originalIntersectionObserver = window.IntersectionObserver
    const observe = vi.fn()
    const disconnect = vi.fn()
    let triggerIntersection: (() => void) | null = null

    getGallery.mockResolvedValue({
      id: 5,
      name: 'Community portraits',
      description: '',
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

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((callback: IntersectionObserverCallback) => {
        triggerIntersection = () =>
          callback(
            [
              {
                isIntersecting: true,
                intersectionRatio: 1,
              } as IntersectionObserverEntry,
            ],
            {
              disconnect,
              observe,
              takeRecords: vi.fn(),
              unobserve: vi.fn(),
            } as unknown as IntersectionObserver,
          )

        return {
          disconnect,
          observe,
          takeRecords: vi.fn(),
          unobserve: vi.fn(),
        } as unknown as IntersectionObserver
      }),
    })

    try {
      render(<CmsGallerySection section={createSection()} />)

      await waitFor(() => {
        expect(observe).toHaveBeenCalled()
      })
      expect(getGallery).not.toHaveBeenCalled()

      await act(async () => {
        triggerIntersection?.()
      })

      await waitFor(() => {
        expect(getGallery).toHaveBeenCalledWith(5)
      })
    } finally {
      if (originalIntersectionObserver) {
        Object.defineProperty(window, 'IntersectionObserver', {
          configurable: true,
          writable: true,
          value: originalIntersectionObserver,
        })
      } else {
        delete (window as Window & { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver
      }
    }
  })
})
