import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PageSection } from '../../api/pagesApi'
import { CmsQuoteSection } from './CmsQuoteSection'

function createSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 13,
    section_name: 'Quote Module',
    section_type: 'quote',
    sort_order: 0,
    is_enabled: true,
    settings: {},
    quote: {
      quote_content: 'Shared stories keep our gatherings close.',
      attribution: 'Community newsletter',
    },
    ...overrides,
  }
}

describe('CmsQuoteSection', () => {
  it('renders the quote content and attribution', () => {
    const { container } = render(<CmsQuoteSection section={createSection()} />)

    expect(screen.getByText(/shared stories keep our gatherings close\./i)).toBeDefined()
    expect(screen.getByText(/community newsletter/i)).toBeDefined()
    expect(container.querySelector('blockquote')).not.toBeNull()
  })

  it('returns no content when the quote text is blank', () => {
    const { container } = render(
      <CmsQuoteSection
        section={createSection({
          quote: {
            quote_content: '   ',
            attribution: 'Community newsletter',
          },
        })}
      />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('omits the attribution rule when the attribution is blank', () => {
    render(
      <CmsQuoteSection
        section={createSection({
          quote: {
            quote_content: 'Shared stories keep our gatherings close.',
            attribution: '   ',
          },
        })}
      />,
    )

    expect(screen.getByText(/shared stories keep our gatherings close\./i)).toBeDefined()
    expect(screen.queryByText(/community newsletter/i)).toBeNull()
  })
})
