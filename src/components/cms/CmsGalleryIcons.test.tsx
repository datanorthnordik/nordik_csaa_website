import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryIcons } from './CmsGalleryIcons'

const sampleItems: CmsGalleryAsset[] = [
  {
    id: 1,
    title: 'Algoma Steel',
    details: '',
    altText: 'Algoma Steel logo',
    imageUrl: 'https://example.com/algoma.png',
    fileUrl: 'https://example.com/algoma.png',
    linkUrl: 'https://example.com/algoma',
    sortOrder: 0,
  },
  {
    id: 2,
    title: 'Jays Care Foundation',
    details: '',
    altText: 'Jays Care Foundation logo',
    imageUrl: 'https://example.com/jays-care.png',
    fileUrl: 'https://example.com/jays-care.png',
    sortOrder: 1,
  },
]

describe('CmsGalleryIcons', () => {
  it('renders linked icon tiles without lightbox buttons', () => {
    render(<CmsGalleryIcons items={sampleItems} />)

    expect(screen.getByRole('link', { name: /algoma steel/i }).getAttribute('href')).toBe(
      'https://example.com/algoma',
    )
    expect(screen.queryByRole('button', { name: /algoma steel/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /jays care foundation/i })).toBeNull()
    expect(screen.getByAltText(/jays care foundation logo/i)).toBeDefined()
  })
})
