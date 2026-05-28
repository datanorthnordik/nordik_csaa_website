import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PageDetailResponse, PageSection } from '../../api/pagesApi'
import { CmsHeaderSection } from './CmsHeaderSection'

function createPage(overrides: Partial<PageDetailResponse> = {}): PageDetailResponse {
  return {
    id: 1,
    page_title: 'CSAA Newsletter',
    url_slug: '/newsletter',
    parent_id: null,
    page_type: 'page',
    parent_page_title: 'Community',
    parent_page_url_slug: '/community',
    status: 'published',
    hero_image_enabled: false,
    hero_image_url: '',
    hero_image_object_key: 'pages/1/hero.jpg',
    hero_image_fetch_url: '/api/pages/1/hero/content',
    seo_page_title: 'CSAA Newsletter',
    seo_page_description: 'Page level description.',
    created_at: '',
    updated_at: '',
    page_detail: null,
    ...overrides,
  }
}

function createHeaderSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 11,
    section_name: 'Header Module',
    section_type: 'header',
    sort_order: 0,
    is_enabled: true,
    settings: {},
    header: {
      main_header_text: 'Welcome to the CSAA newsletter',
      sub_header_text: 'Stories and updates from the community.',
      hierarchy: 'h1_hero',
      text_align: 'left',
    },
    ...overrides,
  }
}

describe('CmsHeaderSection', () => {
  it('renders the hero-style header with page eyebrow and hero image', () => {
    render(
      <CmsHeaderSection
        page={createPage()}
        section={createHeaderSection()}
        isPrimaryHeader
      />,
    )

    expect(
      screen.getByRole('heading', { name: /welcome to the csaa newsletter/i }),
    ).toBeDefined()
    expect(screen.getByText(/^csaa newsletter$/i)).toBeDefined()
    expect(
      screen
        .getByRole('img', { name: /welcome to the csaa newsletter/i })
        .getAttribute('src'),
    ).toContain('/api/pages/1/hero/content')
  })

  it('applies centered alignment to hero headers', () => {
    render(
      <CmsHeaderSection
        page={createPage()}
        section={createHeaderSection({
          header: {
            main_header_text: 'Welcome to the CSAA newsletter',
            sub_header_text: 'Stories and updates from the community.',
            hierarchy: 'h1_hero',
            text_align: 'center',
          },
        })}
        isPrimaryHeader
      />,
    )

    expect(
      screen.getByRole('heading', { name: /welcome to the csaa newsletter/i }).parentElement
        ?.className,
    ).toContain('alignCenter')
  })

  it('uses the parent page title as eyebrow when the header matches the page title', () => {
    render(
      <CmsHeaderSection
        page={createPage({ page_title: 'Contact Us' })}
        section={createHeaderSection({
          header: {
            main_header_text: 'Contact Us',
            sub_header_text: 'Reach out to the team.',
            hierarchy: 'h2_section',
            text_align: 'right',
          },
        })}
        isPrimaryHeader={false}
      />,
    )

    expect(screen.getByRole('heading', { name: /^contact us$/i })).toBeDefined()
    expect(screen.getByText(/^community$/i)).toBeDefined()
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('heading', { name: /^contact us$/i }).parentElement?.className).toContain(
      'alignRight',
    )
  })

  it('keeps the page title at the top instead of repeating it in lower section headers', () => {
    render(
      <CmsHeaderSection
        page={createPage()}
        section={createHeaderSection({
          header: {
            main_header_text: 'Programs and services',
            sub_header_text: 'Ways the community can connect.',
            hierarchy: 'h2_section',
            text_align: 'left',
          },
        })}
        isPrimaryHeader={false}
      />,
    )

    expect(
      screen.getByRole('heading', { name: /programs and services/i }),
    ).toBeDefined()
    expect(screen.queryByText(/^csaa newsletter$/i)).toBeNull()
  })

  it('uses the page title as the heading without duplicating it or showing a media placeholder', () => {
    const { queryByTestId } = render(
      <CmsHeaderSection
        page={createPage({
          hero_image_object_key: '',
          hero_image_fetch_url: '',
        })}
        section={createHeaderSection({
          header: {
            main_header_text: '   ',
            sub_header_text: '',
            hierarchy: 'h1_hero',
            text_align: 'diagonal',
          },
        })}
        isPrimaryHeader
      />,
    )

    expect(screen.getByRole('heading', { name: /^csaa newsletter$/i })).toBeDefined()
<<<<<<< HEAD
    expect(screen.getAllByText(/^csaa newsletter$/i)).toHaveLength(1)
    expect(screen.queryByRole('img')).toBeNull()
    expect(queryByTestId('cms-hero-media-fallback')).toBeNull()
    expect(screen.getByRole('heading', { name: /^csaa newsletter$/i }).parentElement?.className).toContain(
      'alignLeft',
=======
    expect(screen.queryByText(/page level description\./i)).toBeNull()
    expect(screen.queryByTestId('cms-header-hero-background')).toBeNull()
  })

  it('does not attach the page hero image when display is disabled', () => {
    render(
      <CmsHeaderSection
        page={createPage({
          hero_image_enabled: false,
          hero_image_object_key: 'pages/1/hero.jpg',
          hero_image_fetch_url: '/api/pages/1/hero/content',
        })}
        section={createHeaderSection()}
        isPrimaryHeader
      />,
>>>>>>> 7c0fbf18d0265774dcd451f52c7f4852d611d0ee
    )
  })
})
