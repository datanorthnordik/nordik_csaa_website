import { describe, expect, it } from 'vitest'
import { blogDetailPath, slugifyBlogHeading } from './blogSlug'

describe('slugifyBlogHeading', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugifyBlogHeading('The Tree Planting')).toBe('the-tree-planting')
  })

  it('drops punctuation and collapses separators', () => {
    expect(slugifyBlogHeading('Shirley: A Residential School Story')).toBe(
      'shirley-a-residential-school-story',
    )
    expect(slugifyBlogHeading('Dan Pine & the Pine Trees')).toBe(
      'dan-pine-the-pine-trees',
    )
  })

  it('strips diacritics and trims leading/trailing separators', () => {
    expect(slugifyBlogHeading('  Élder Café  ')).toBe('elder-cafe')
  })
})

describe('blogDetailPath', () => {
  it('builds the hub-relative detail path from the heading', () => {
    expect(blogDetailPath({ heading: 'The Tree Planting' })).toBe(
      '/living-history-hub/the-tree-planting',
    )
  })
})
