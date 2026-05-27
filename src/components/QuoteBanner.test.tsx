import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuoteBanner } from './QuoteBanner'

describe('QuoteBanner', () => {
  it('renders the quote and attribution when both are provided', () => {
    const { container } = render(
      <QuoteBanner
        quote='"We walk this path of healing together."'
        attribution="In Solemn Remembrance"
      />,
    )

    expect(screen.getByText(/we walk this path of healing together/i)).toBeDefined()
    expect(screen.getByText(/in solemn remembrance/i)).toBeDefined()
    expect(container.querySelector('blockquote')).not.toBeNull()
  })

  it('returns no content when the quote is blank', () => {
    const { container } = render(
      <QuoteBanner quote="   " attribution="In Solemn Remembrance" />,
    )

    expect(container.innerHTML).toBe('')
  })
})
