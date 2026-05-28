import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryCarousel } from './CmsGalleryCarousel'

const sampleItems: CmsGalleryAsset[] = [
  {
    id: 1,
    title: 'Orange Shirt Day',
    details: 'Community gathering outside the monument',
    altText: 'Community gathering outside the monument',
    imageUrl: 'https://example.com/orange-shirt.jpg',
    fileUrl: 'https://example.com/orange-shirt.jpg',
    sortOrder: 0,
  },
  {
    id: 2,
    title: 'Sunflower Walk',
    details: 'Visitors standing in the field',
    altText: 'Visitors standing in the field',
    imageUrl: 'https://example.com/sunflower.jpg',
    fileUrl: 'https://example.com/sunflower.jpg',
    sortOrder: 1,
  },
  {
    id: 3,
    title: 'Honor Song',
    details: 'Family gathering at sunset',
    altText: 'Family gathering at sunset',
    imageUrl: 'https://example.com/song.jpg',
    fileUrl: 'https://example.com/song.jpg',
    sortOrder: 2,
  },
]

describe('CmsGalleryCarousel', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('moves to the next gallery slide', () => {
    render(<CmsGalleryCarousel items={sampleItems} onOpen={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /orange shirt day/i })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByRole('heading', { name: /sunflower walk/i })).toBeDefined()
  })
})
