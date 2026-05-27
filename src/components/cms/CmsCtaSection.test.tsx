import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PageSection } from '../../api/pagesApi'
import { CmsCtaSection } from './CmsCtaSection'

function createSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 14,
    section_name: 'CTA Banner',
    section_type: 'cta_banner',
    sort_order: 0,
    is_enabled: true,
    settings: {},
    cta_banner: {
      banner_heading: 'Online donation',
      banner_message: 'You can donate via our CanadaHelps platform.',
      button_text: 'Donate now',
      button_url: 'https://example.com/donate',
      open_in_new_tab: true,
    },
    ...overrides,
  }
}

describe('CmsCtaSection', () => {
  it('renders the CTA content and external link settings', () => {
    render(<CmsCtaSection section={createSection()} />)

    expect(screen.getByRole('heading', { name: /online donation/i })).toBeDefined()
    expect(
      screen.getByText(/you can donate via our canadahelps platform\./i),
    ).toBeDefined()
    expect(screen.getByRole('link', { name: /donate now/i }).getAttribute('href')).toBe(
      'https://example.com/donate',
    )
    expect(screen.getByRole('link', { name: /donate now/i }).getAttribute('target')).toBe(
      '_blank',
    )
  })

  it('omits the action button when the destination is blank', () => {
    render(
      <CmsCtaSection
        section={createSection({
          cta_banner: {
            banner_heading: 'Online donation',
            banner_message: 'You can donate via our CanadaHelps platform.',
            button_text: 'Donate now',
            button_url: '   ',
            open_in_new_tab: false,
          },
        })}
      />,
    )

    expect(screen.queryByRole('link', { name: /donate now/i })).toBeNull()
  })

  it('renders the optional CTA image when one is supplied', () => {
    render(
      <CmsCtaSection
        section={createSection({
          cta_banner: {
            banner_heading: 'Community Support',
            banner_message: 'We are here for the community.',
            button_text: 'Learn more',
            button_url: '/community-support',
            open_in_new_tab: false,
            image: {
              file_url: '/api/pages/sections/14/cta-image/content',
              fetch_url: '/api/pages/sections/14/cta-image/content',
              storage_uri: 'gs://drive-bucket/pages/sections/14/cta.png',
              gcp_object_key: 'pages/sections/14/cta.png',
            },
          },
        })}
      />,
    )

    expect(screen.getByAltText(/community support/i).getAttribute('src')).toContain(
      '/api/pages/sections/14/cta-image/content',
    )
  })
})
