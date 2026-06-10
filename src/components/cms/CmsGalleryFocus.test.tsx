import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryFocus } from './CmsGalleryFocus'

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

describe('CmsGalleryFocus', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('switches the featured image from the thumbnail rail', () => {
    render(<CmsGalleryFocus items={sampleItems} showTitleDescription onOpen={vi.fn()} />)

    expect(
      screen.getByRole('heading', { name: /fran fletcher-luther/i }),
    ).toBeDefined()

    fireEvent.click(screen.getByText(/elder mary/i).closest('button') as HTMLButtonElement)

    expect(screen.getByRole('heading', { name: /elder mary/i })).toBeDefined()
  })
})
