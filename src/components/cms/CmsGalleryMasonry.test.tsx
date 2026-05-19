import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryMasonry } from './CmsGalleryMasonry'

const sampleItems: CmsGalleryAsset[] = [
  {
    id: 1,
    title: 'Shingwauk Hall',
    details: 'Exhibit hallway wall panels',
    altText: 'Exhibit hallway wall panels',
    imageUrl: 'https://example.com/hall.jpg',
    fileUrl: 'https://example.com/hall.jpg',
    sortOrder: 0,
  },
  {
    id: 2,
    title: 'Portrait Collection',
    details: 'Community portraits in the archive',
    altText: 'Community portraits in the archive',
    imageUrl: 'https://example.com/portraits.jpg',
    fileUrl: 'https://example.com/portraits.jpg',
    sortOrder: 1,
  },
]

describe('CmsGalleryMasonry', () => {
  it('renders masonry tiles and opens the clicked image', () => {
    const onOpen = vi.fn()

    render(<CmsGalleryMasonry items={sampleItems} onOpen={onOpen} />)

    expect(screen.getByText(/shingwauk hall/i)).toBeDefined()
    expect(screen.getByText(/community portraits in the archive/i)).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /shingwauk hall/i }))

    expect(onOpen).toHaveBeenCalledWith(0)
  })
})
