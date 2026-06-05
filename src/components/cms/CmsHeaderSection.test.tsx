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
    hero_image_enabled: true,
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
      sub_header_text: 'Community updates',
      description: 'Stories and updates from the community.',
      hierarchy: 'h1_hero',
      text_align: 'left',
      underline_enabled: false,
    },
    ...overrides,
  }
}

describe('CmsHeaderSection', () => {
  it('renders the hero-style header with background media, eyebrow, and description', () => {
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
    expect(screen.getByText(/^community updates$/i)).toBeDefined()
    expect(screen.getByText(/stories and updates from the community\./i)).toBeDefined()
    expect(
      screen.getByTestId('cms-header-hero-background').getAttribute('src'),
    ).toContain('/api/pages/1/hero/content')
    expect(
      screen.getByTestId('cms-header-hero-background').getAttribute('loading'),
    ).toBe('eager')
    expect(
      screen.getByTestId('cms-header-hero-background').getAttribute('fetchpriority'),
    ).toBe('high')
  })

  it('renders h2 headers with eyebrow, underline, description, and text alignment', () => {
    render(
      <CmsHeaderSection
        page={createPage()}
        section={createHeaderSection({
          header: {
            main_header_text: 'Programs and services',
            sub_header_text: 'Purpose & Path',
            description: 'Ways the community can connect.',
            hierarchy: 'h2_section',
            text_align: 'right',
            underline_enabled: true,
          },
        })}
        isPrimaryHeader={false}
      />,
    )

    expect(
      screen.getByRole('heading', { name: /programs and services/i }),
    ).toBeDefined()
    expect(screen.getByText(/^purpose & path$/i)).toBeDefined()
    expect(screen.getByText(/ways the community can connect\./i)).toBeDefined()
    expect(
      screen.getByRole('heading', { name: /programs and services/i }).parentElement?.className,
    ).toContain('alignRight')
    expect(
      screen.getByRole('heading', { name: /programs and services/i }).parentElement?.querySelector(
        'div[aria-hidden="true"]',
      ),
    ).not.toBeNull()
  })

  it('keeps h2 headers in the new layout even when only the subtitle is provided', () => {
    render(
      <CmsHeaderSection
        page={createPage()}
        section={createHeaderSection({
          header: {
            main_header_text: 'Contact Us',
            sub_header_text: 'Need help',
            description: '',
            hierarchy: 'h2_section',
            text_align: 'left',
            underline_enabled: false,
          },
        })}
        isPrimaryHeader={false}
      />,
    )

    expect(screen.getByRole('heading', { name: /^contact us$/i })).toBeDefined()
    expect(screen.getByText(/^need help$/i)).toBeDefined()
    expect(screen.queryByText(/page level description\./i)).toBeNull()
  })

  it('falls back to the page title and seo description when the hero header content is blank', () => {
    render(
      <CmsHeaderSection
        page={createPage({
          hero_image_object_key: '',
          hero_image_fetch_url: '',
        })}
        section={createHeaderSection({
          header: {
            main_header_text: '   ',
            sub_header_text: '',
            description: '',
            hierarchy: 'h1_hero',
            text_align: 'diagonal',
            underline_enabled: false,
          },
        })}
        isPrimaryHeader
      />,
    )

    expect(screen.getByRole('heading', { name: /^csaa newsletter$/i })).toBeDefined()
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
    )

    expect(screen.getByRole('heading', { name: /welcome to the csaa newsletter/i })).toBeDefined()
    expect(screen.queryByTestId('cms-header-hero-background')).toBeNull()
  })
})
