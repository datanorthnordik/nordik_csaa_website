import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import type { PageDocument, PageSection } from '../../api/pagesApi'
import { downloadPublicFile } from '../../lib/fileDownload'
import { CmsDocumentsSection } from './CmsDocumentsSection'

vi.mock('../../lib/fileDownload', () => ({
  downloadPublicFile: vi.fn(),
}))

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
    sort_order: 1,
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
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('en')
  })

  it('renders the shared document showcase in sort order and downloads through the public helper', async () => {
    vi.mocked(downloadPublicFile).mockResolvedValue(undefined)

    render(
      <CmsDocumentsSection
        section={createSection({
          documents: {
            items: [
              createDocument({
                id: 22,
                display_name: 'Program flyer',
                description: 'Download the event flyer.',
                original_file_name: 'flyer.jpg',
                file_name: 'flyer.jpg',
                fetch_url: '/api/pages/documents/22/content',
                mime_type: 'image/jpeg',
                sort_order: 0,
              }),
              createDocument(),
            ],
          },
        })}
      />,
    )

    expect(
      screen.getByRole('heading', { name: /additional documents/i }),
    ).toBeDefined()
    expect(screen.getByText(/program flyer/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /download document/i })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/board agenda/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(downloadPublicFile).toHaveBeenCalledWith(
        expect.stringContaining('/api/pages/documents/21/content'),
        'agenda.pdf',
      )
    })
  })

  it('returns null when no document has a resolvable public url', () => {
    const { container } = render(
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

    expect(container.firstChild).toBeNull()
  })
})
