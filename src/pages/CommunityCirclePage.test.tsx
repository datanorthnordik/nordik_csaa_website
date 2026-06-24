import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CommunityCirclePage } from './CommunityCirclePage'

describe('CommunityCirclePage', () => {
  it('opens only the photo gallery card in a new tab', () => {
    render(
      <MemoryRouter initialEntries={['/community-circle']}>
        <CommunityCirclePage />
      </MemoryRouter>,
    )

    const galleryLink = screen.getByRole('link', { name: /photo gallery/i })
    const cookbookLink = screen.getByRole('link', { name: /community cookbook/i })

    expect(galleryLink.getAttribute('href')).toBe('/community-circle/gallery')
    expect(galleryLink.getAttribute('target')).toBe('_blank')
    expect(galleryLink.getAttribute('rel')).toBe('noopener noreferrer')
    expect(cookbookLink.getAttribute('target')).toBeNull()
    expect(cookbookLink.getAttribute('rel')).toBeNull()
  })
})
