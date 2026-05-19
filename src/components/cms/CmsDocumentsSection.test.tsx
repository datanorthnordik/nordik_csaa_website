import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PageDocument, PageSection } from '../../api/pagesApi'
import { CmsDocumentsSection } from './CmsDocumentsSection'

function createDocument(overrides: Partial<PageDocument> = {}): PageDocument {
  return {
    id: 21,
    display_name: 'Board agenda',
    description: 'Download the latest meeting agenda.',
    original_file_name: 'agenda.pdf',
    file_name: 'agenda.pdf',
    file_url: '',
    fetch_url: '/api/pages/documents/21/content',
    storage_uri: '',
    gcp_object_key: '',
    mime_type: 'application/pdf',
    file_size: 1024,
    sort_order: 0,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

function createSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 15,
    section_name: 'Document Module',
    section_type: 'document',
    sort_order: 0,
    is_enabled: true,
    settings: {},
    documents: {
      items: [createDocument()],
    },
    ...overrides,
  }
}

describe('CmsDocumentsSection', () => {
  it('renders linked document cards with resolved API URLs and badges', () => {
    render(<CmsDocumentsSection section={createSection()} />)

    expect(screen.getByRole('link', { name: /board agenda/i }).getAttribute('href')).toContain(
      '/api/pages/documents/21/content',
    )
    expect(screen.getByText(/^pdf$/i)).toBeDefined()
    expect(screen.getByText(/download the latest meeting agenda\./i)).toBeDefined()
  })

  it('skips documents that do not have a resolvable public url', () => {
    render(
      <CmsDocumentsSection
        section={createSection({
          documents: {
            items: [
              createDocument({
                id: 22,
                fetch_url: '',
                file_url: 'gs://drive-bucket/private.pdf',
              }),
            ],
          },
        })}
      />,
    )

    expect(screen.queryByRole('link')).toBeNull()
  })
})
