import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../constants/api'
import {
  publicMemorialApiEntryToLocal,
  resolvePublicMemorialPortraitUrl,
  type PublicMemorialApiEntry,
} from './memorialsApi'

function createApiEntry(
  overrides: Partial<PublicMemorialApiEntry> = {},
): PublicMemorialApiEntry {
  return {
    id: 7,
    full_name: 'Agnes Wabano',
    affiliation: 'CSAA',
    category: 'friend',
    category_label: 'Friend',
    status: 'published',
    date_of_birth: '1934-04-01',
    date_of_passing: '2021-09-02',
    portrait_content_url: '',
    created_at: '',
    updated_at: '',
    published_at: '',
    ...overrides,
  }
}

describe('memorialsApi', () => {
  it('keeps portrait urls empty when a memorial entry has no portrait', () => {
    const entry = publicMemorialApiEntryToLocal(createApiEntry())

    expect(entry.portraitContentUrl).toBe('')
  })

  it('normalizes relative api portrait urls to the configured api host', () => {
    expect(
      resolvePublicMemorialPortraitUrl({
        id: 9,
        portraitContentUrl: '/api/memorial/9/portrait/content',
      }),
    ).toBe(`${API_BASE_URL}/api/memorial/9/portrait/content`)
  })

  it('keeps fully qualified portrait urls unchanged', () => {
    expect(
      resolvePublicMemorialPortraitUrl({
        id: 11,
        portraitContentUrl: 'https://files.example.com/memorial/11/portrait.jpg',
      }),
    ).toBe('https://files.example.com/memorial/11/portrait.jpg')
  })

  it('maps relative portrait urls onto the configured api host', () => {
    const entry = publicMemorialApiEntryToLocal(
      createApiEntry({
        portrait_content_url: '/api/memorial/7/portrait/content',
      }),
    )

    expect(entry.portraitContentUrl).toBe(
      `${API_BASE_URL}/api/memorial/7/portrait/content`,
    )
  })
})
