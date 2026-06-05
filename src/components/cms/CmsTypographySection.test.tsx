import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PageSection } from '../../api/pagesApi'
import { CmsTypographySection } from './CmsTypographySection'

function createSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 12,
    section_name: 'Typography',
    section_type: 'typography',
    sort_order: 0,
    is_enabled: true,
    settings: {},
    typography: {
      html_content: '',
      text_content: 'Fallback body copy.',
      text_align: 'left',
    },
    ...overrides,
  }
}

describe('CmsTypographySection', () => {
  it('renders rich html content when present', () => {
    render(
      <CmsTypographySection
        section={createSection({
          typography: {
            html_content: '<h2>Latest stories</h2><p>Shared from the community.</p>',
            text_content: 'Fallback body copy.',
            text_align: 'center',
          },
        })}
      />,
    )

    expect(screen.getByRole('heading', { name: /latest stories/i })).toBeDefined()
    expect(screen.getByText(/shared from the community\./i)).toBeDefined()
  })

  it('renders plain text when html content is empty', () => {
    render(<CmsTypographySection section={createSection()} />)

    expect(screen.getByText(/fallback body copy\./i)).toBeDefined()
  })

  it('adds lazy-loading hints to rich text images', () => {
    render(
      <CmsTypographySection
        section={createSection({
          typography: {
            html_content:
              '<p><img src="/images/community.jpg" alt="Community archive" /></p>',
            text_content: '',
            text_align: 'left',
          },
        })}
      />,
    )

    const image = screen.getByAltText(/community archive/i)

    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.getAttribute('decoding')).toBe('async')
    expect(image.getAttribute('fetchpriority')).toBe('low')
  })
})
