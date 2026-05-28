import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PageDetailResponse } from '../../api/pagesApi'
import { CmsFallbackHero } from './CmsFallbackHero'

function createPage(overrides: Partial<PageDetailResponse> = {}): PageDetailResponse {
  return {
    id: 1,
    page_title: 'CSAA Newsletter',
    url_slug: '/newsletter',
    parent_id: null,
    page_type: 'page',
    parent_page_title: '',
    parent_page_url_slug: '',
    status: 'published',
    hero_image_enabled: true,
    hero_image_url: '',
    hero_image_object_key: '',
    hero_image_fetch_url: '',
    seo_page_title: 'CSAA Newsletter',
    seo_page_description: 'Community updates and stories.',
    created_at: '',
    updated_at: '',
    page_detail: null,
    ...overrides,
  }
}

describe('CmsFallbackHero', () => {
  it('renders the page title, description, and resolved hero background', () => {
    render(
      <CmsFallbackHero
        page={createPage({
          hero_image_enabled: true,
          hero_image_fetch_url: '/api/pages/1/hero/content',
        })}
      />,
    )

    expect(screen.getByRole('heading', { name: /csaa newsletter/i })).toBeDefined()
    expect(screen.getByText(/community updates and stories\./i)).toBeDefined()
    expect(
      screen.getByTestId('cms-fallback-hero-background').getAttribute('src'),
    ).toContain('/api/pages/1/hero/content')
  })

  it('uses fallback copy even when no image exists', () => {
    render(<CmsFallbackHero page={createPage()} />)

    expect(screen.getByRole('heading', { name: /csaa newsletter/i })).toBeDefined()
    expect(screen.queryByText(/community updates and stories\./i)).toBeNull()
    expect(screen.queryByTestId('cms-fallback-hero-background')).toBeNull()
  })

  it('does not attach the hero image when display is disabled', () => {
    render(
      <CmsFallbackHero
        page={createPage({
          hero_image_enabled: false,
          hero_image_fetch_url: '/api/pages/1/hero/content',
        })}
      />,
    )

    expect(screen.getByRole('heading', { name: /csaa newsletter/i })).toBeDefined()
    expect(screen.queryByTestId('cms-fallback-hero-background')).toBeNull()
  })
})
