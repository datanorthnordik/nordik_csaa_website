import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pagesApi, type PageDetailResponse } from '../api/pagesApi'
import i18n from '../i18n'
import { CmsPage } from './CmsPage'

vi.mock('../api/pagesApi', () => ({
  pagesApi: {
    getPageBySlug: vi.fn(),
    peekPageBySlug: vi.fn(),
  },
}))

const getPageBySlug = vi.mocked(pagesApi.getPageBySlug)
const peekPageBySlug = vi.mocked(pagesApi.peekPageBySlug)

function createPage(overrides: Partial<PageDetailResponse> = {}): PageDetailResponse {
  return {
    id: 14,
    page_title: 'Community Support Team',
    url_slug: '/community-support-team',
    parent_id: null,
    page_type: 'page',
    parent_page_title: '',
    parent_page_url_slug: '',
    status: 'published',
    hero_image_enabled: false,
    hero_image_url: '',
    hero_image_object_key: '',
    hero_image_fetch_url: '',
    seo_page_title: 'Community Support Team',
    seo_page_description:
      'Programs, resources, and pathways to healing from the Children of Shingwauk Alumni Association Community Support Team.',
    created_at: '',
    updated_at: '',
    page_detail: {
      id: 1,
      page_id: 14,
      template_key: 'default',
      settings: {},
      schema_version: 1,
      sections: [
        {
          id: 101,
          section_name: 'Hero',
          section_type: 'header',
          sort_order: 1,
          is_enabled: true,
          settings: {},
          header: {
            main_header_text: 'Community Support Team',
            sub_header_text: 'Support rooted in community',
            description:
              'Programs, resources, and pathways to healing from the Children of Shingwauk Alumni Association Community Support Team.',
            hierarchy: 'h1_hero',
            text_align: 'left',
            underline_enabled: false,
          },
        },
      ],
    },
    ...overrides,
  }
}

function renderPage(path = '/community-support-team') {
  window.history.pushState({}, '', path)

  return render(
    <MemoryRouter initialEntries={[path]}>
      <CmsPage />
    </MemoryRouter>,
  )
}

describe('CmsPage', () => {
  beforeEach(async () => {
    getPageBySlug.mockReset()
    peekPageBySlug.mockReset()
    peekPageBySlug.mockReturnValue(null)
    await i18n.changeLanguage('en')
  })

  it('publishes stable seo metadata for cms routes like community support team', async () => {
    getPageBySlug.mockResolvedValue(createPage())

    renderPage()

    expect(
      await screen.findByRole('heading', { name: /community support team/i }),
    ).toBeDefined()

    await waitFor(() => {
      expect(getPageBySlug).toHaveBeenCalledWith('/community-support-team')
      expect(document.title).toBe(
        'Community Support Team | Children of Shingwauk Alumni Association',
      )
      expect(
        document.head.querySelector('meta[name="description"]')?.getAttribute('content'),
      ).toBe(
        'Programs, resources, and pathways to healing from the Children of Shingwauk Alumni Association Community Support Team.',
      )
      expect(
        document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ).toBe(`${window.location.origin}/community-support-team`)

      const structuredData = JSON.parse(
        document.querySelector('script[data-page-seo="structured-data"]')?.textContent ?? '{}',
      )
      expect(structuredData['@type']).toBe('WebPage')
      expect(structuredData.name).toBe('Community Support Team')
      expect(structuredData.url).toBe(`${window.location.origin}/community-support-team`)
    })
  })
})
