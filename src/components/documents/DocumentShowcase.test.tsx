import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import {
  DocumentShowcase,
  type DocumentShowcaseItem,
} from './DocumentShowcase'

const sampleItems: DocumentShowcaseItem[] = [
  {
    id: 1,
    title: 'Community poster',
    description: 'Opening celebration poster',
    previewUrl: 'https://example.com/poster.jpg',
    downloadUrl: 'https://example.com/poster.jpg',
    downloadFileName: 'poster.jpg',
    badgeLabel: 'JPG',
    mimeType: 'image/jpeg',
  },
  {
    id: 2,
    title: 'Workshop agenda',
    description: 'Detailed workshop agenda',
    previewUrl: 'https://example.com/agenda.pdf',
    downloadUrl: 'https://example.com/agenda.pdf',
    downloadFileName: 'agenda.pdf',
    badgeLabel: 'PDF',
    mimeType: 'application/pdf',
  },
  {
    id: 3,
    title: 'Facilitator guide',
    description: 'Session facilitator guide',
    previewUrl: 'https://example.com/facilitator-guide.docx',
    downloadUrl: 'https://example.com/facilitator-guide.docx',
    downloadFileName: 'facilitator-guide.docx',
    badgeLabel: 'DOCX',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
]

describe('DocumentShowcase', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('returns null when there are no items', () => {
    const { container } = render(
      <DocumentShowcase
        heading="Documents"
        items={[]}
        getSummary={() => ({ title: 'Unused' })}
        getDownloadLabel={() => 'Download'}
        onDownload={vi.fn()}
        downloadErrorText="Download failed"
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders agenda-style previews, navigates between items, and opens the viewer', async () => {
    render(
      <DocumentShowcase
        heading="Additional documents"
        items={sampleItems}
        getSummary={(item) => ({
          title: item.title,
          description: item.description,
        })}
        getDownloadLabel={(item) =>
          item.mimeType === 'application/pdf' ? 'Download PDF' : 'Download Document'
        }
        onDownload={vi.fn().mockResolvedValue(undefined)}
        downloadErrorText="Download failed"
      />,
    )

    expect(
      screen.getByRole('heading', { name: /additional documents/i }),
    ).toBeDefined()
    expect(screen.getByText('1 / 3')).toBeDefined()
    expect(screen.getByAltText(/community poster/i)).toBeDefined()
    expect(screen.getByText(/opening celebration poster/i)).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('2 / 3')).toBeDefined()
    expect(screen.getByText(/detailed workshop agenda/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeDefined()
    expect(screen.getByTitle(/workshop agenda preview/i)).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /workshop agenda/i }))

    const dialog = screen.getByRole('dialog', { name: /workshop agenda/i })
    expect(within(dialog).getByTitle(/workshop agenda/i)).toBeDefined()

    fireEvent.click(within(dialog).getByRole('button', { name: /previous/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /community poster/i })).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    const officePreview = screen.getByTitle(/facilitator guide preview/i)
    expect(officePreview.getAttribute('src')).toContain(
      'https://view.officeapps.live.com/op/embed.aspx?src=',
    )
    expect(officePreview.getAttribute('src')).toContain(
      encodeURIComponent('https://example.com/facilitator-guide.docx'),
    )

    fireEvent.click(screen.getByRole('button', { name: /facilitator guide/i }))

    const officeDialog = screen.getByRole('dialog', { name: /facilitator guide/i })
    const officeViewer = within(officeDialog).getByTitle(/facilitator guide/i)
    expect(officeViewer.getAttribute('src')).toContain(
      encodeURIComponent('https://example.com/facilitator-guide.docx'),
    )
  })

  it('downloads the active item and shows an error if the download fails', async () => {
    const onDownload = vi
      .fn<(item: DocumentShowcaseItem) => Promise<void>>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('boom'))

    render(
      <DocumentShowcase
        heading="Additional documents"
        items={sampleItems}
        getSummary={(item) => ({
          title: item.title,
          description: item.description,
        })}
        getDownloadLabel={(item) =>
          item.mimeType === 'application/pdf' ? 'Download PDF' : 'Download Document'
        }
        onDownload={onDownload}
        downloadErrorText="Download failed"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /download document/i }))

    await waitFor(() => {
      expect(onDownload).toHaveBeenCalledWith(sampleItems[0])
    })

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    expect(await screen.findByText(/download failed/i)).toBeDefined()
  })
})
