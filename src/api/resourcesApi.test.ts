import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../constants/api'
import {
  publicResourceApiEntryToLocal,
  resolvePublicResourceContentUrl,
  type PublicResourceApiEntry,
} from './resourcesApi'

function createApiEntry(overrides: Partial<PublicResourceApiEntry> = {}): PublicResourceApiEntry {
  return {
    id: 7,
    name: 'Community guide',
    description: 'Helpful support information.',
    category: 'report',
    category_label: 'Report',
    visibility: 'public',
    link_url: '',
    file_name: 'guide.docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size: 1024,
    has_document: true,
    content_url: '',
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

describe('resourcesApi', () => {
  it('falls back to the absolute resource content endpoint when the API does not provide a public content url', () => {
    const entry = publicResourceApiEntryToLocal(createApiEntry())

    expect(entry.contentUrl).toBe(`${API_BASE_URL}/api/resources/7/content`)
  })

  it('normalizes relative api content urls to the configured api host', () => {
    expect(
      resolvePublicResourceContentUrl({
        id: 9,
        contentUrl: '/api/resources/9/content?download=1',
      }),
    ).toBe(`${API_BASE_URL}/api/resources/9/content?download=1`)
  })

  it('keeps fully qualified resource content urls unchanged', () => {
    expect(
      resolvePublicResourceContentUrl({
        id: 11,
        contentUrl: 'https://files.example.com/resources/11/content',
      }),
    ).toBe('https://files.example.com/resources/11/content')
  })
})
