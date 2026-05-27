import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryGrid } from './CmsGalleryGrid'

const sampleItems: CmsGalleryAsset[] = [
  {
    id: 1,
    title: 'Fran Fletcher-Luther',
    details: 'April 26, 1935 - October 26, 2019',
    altText: 'Portrait of Fran Fletcher-Luther',
    imageUrl: 'https://example.com/fran.jpg',
    fileUrl: 'https://example.com/fran.jpg',
    sortOrder: 0,
  },
  {
    id: 2,
    title: 'Elder Mary',
    details: 'Community gathering portrait',
    altText: 'Portrait of Elder Mary',
    imageUrl: 'https://example.com/mary.jpg',
    fileUrl: 'https://example.com/mary.jpg',
    sortOrder: 1,
  },
]

describe('CmsGalleryGrid', () => {
  it('renders image titles and details and opens the selected slide', () => {
    const onOpen = vi.fn()

    render(<CmsGalleryGrid items={sampleItems} showTitleDescription onOpen={onOpen} />)

    expect(screen.getByText(/fran fletcher-luther/i)).toBeDefined()
    expect(screen.getByText(/april 26, 1935 - october 26, 2019/i)).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /elder mary/i }))

    expect(onOpen).toHaveBeenCalledWith(1)
  })
})
