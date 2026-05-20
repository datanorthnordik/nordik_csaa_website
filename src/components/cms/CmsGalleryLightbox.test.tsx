import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryLightbox } from './CmsGalleryLightbox'

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
    details: 'Community storyteller portrait',
    altText: 'Portrait of Elder Mary',
    imageUrl: 'https://example.com/mary.jpg',
    fileUrl: 'https://example.com/mary.jpg',
    sortOrder: 1,
  },
]

describe('CmsGalleryLightbox', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('supports slideshow, thumbnail rail, navigation, and close controls', () => {
    const onClose = vi.fn()
    const onSelect = vi.fn()

    render(
      <CmsGalleryLightbox
        items={sampleItems}
        activeIndex={0}
        onClose={onClose}
        onSelect={onSelect}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: /fran fletcher-luther/i }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /play slideshow/i }))
    expect(screen.getByRole('button', { name: /pause slideshow/i })).toBeDefined()

    expect(screen.queryByRole('button', { name: /elder mary/i })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /show thumbnails/i }))
    expect(screen.getByRole('button', { name: /hide thumbnails/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /elder mary/i })).toBeDefined()
    expect(
      screen.getByRole('button', { name: /fran fletcher-luther/i }).getAttribute('aria-current'),
    ).toBe('true')
    expect(screen.getAllByText(/current/i)).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onSelect).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
