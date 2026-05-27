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
  it('renders the page title and resolved hero image', () => {
    render(
      <CmsFallbackHero
        page={createPage({
          hero_image_enabled: true,
          hero_image_fetch_url: '/api/pages/1/hero/content',
        })}
      />,
    )

    expect(screen.getByRole('img', { name: /csaa newsletter/i }).getAttribute('src')).toContain(
      '/api/pages/1/hero/content',
    )
  })

  it('falls back to the decorative media block when no image exists', () => {
    render(<CmsFallbackHero page={createPage()} />)

    expect(screen.queryByRole('img')).toBeNull()
  })

  it('does not render the hero image when display is disabled', () => {
    render(
      <CmsFallbackHero
        page={createPage({
          hero_image_enabled: false,
          hero_image_fetch_url: '/api/pages/1/hero/content',
        })}
      />,
    )

    expect(screen.queryByRole('img')).toBeNull()
  })
})
