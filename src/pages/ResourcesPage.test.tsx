import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../constants/api'
import i18n from '../i18n'
import { downloadPublicFile } from '../lib/fileDownload'
import { CommunityResourcesPage } from './ResourcesPage'

const { listResources } = vi.hoisted(() => ({
  listResources: vi.fn(),
}))

vi.mock('../api/resourcesApi', async () => {
  const actual = await vi.importActual<typeof import('../api/resourcesApi')>('../api/resourcesApi')

  return {
    ...actual,
    publicResourcesApi: {
      ...actual.publicResourcesApi,
      listResources,
    },
  }
})

vi.mock('../lib/fileDownload', () => ({
  downloadPublicFile: vi.fn(),
}))

describe('CommunityResourcesPage', () => {
  function renderPage() {
    window.history.pushState({}, '', '/community-circle/community-support-team/resources')

    return render(
      <MemoryRouter initialEntries={['/community-circle/community-support-team/resources']}>
        <CommunityResourcesPage />
      </MemoryRouter>,
    )
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('en')

    listResources.mockResolvedValue({
      items: [
        {
          id: '7',
          name: 'Community guide',
          description: 'Helpful support information.',
          category: 'report',
          categoryLabel: 'Report',
          visibility: 'public',
          linkUrl: '',
          fileName: 'guide.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSize: 1024,
          hasDocument: true,
          contentUrl: '',
          createdAt: '',
          updatedAt: '',
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    })

    vi.mocked(downloadPublicFile).mockResolvedValue(undefined)
  })

  it('opens uploaded resources in the shared viewer modal, publishes stable seo metadata, and uses descriptive internal link text', async () => {
    renderPage()

    const openButton = await screen.findByRole('button', {
      name: /open documents: community guide/i,
    })
    expect(openButton).toBeDefined()
    expect(document.title).toBe(
      'Resources & Support | Children of Shingwauk Alumni Association',
    )
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(
      'Browse educational resources, media, reports, and support links from the Children of Shingwauk Alumni Association Community Support Team.',
    )
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe(`${window.location.origin}/community-circle/community-support-team/resources`)
    expect(
      screen.getByRole('heading', { level: 2, name: /browse community resources/i }),
    ).toBeDefined()

    const learnMoreLink = screen.getByRole('link', {
      name: /learn about the community support team/i,
    })
    expect(learnMoreLink.getAttribute('href')).toBe('/community-support-team')

    fireEvent.click(openButton)

    const dialog = screen.getByRole('dialog', { name: /community guide/i })
    const frame = within(dialog).getByTitle(/community guide/i)

    expect(frame.getAttribute('src')).toBe(`${API_BASE_URL}/api/resources/7/content`)
    expect(screen.queryByText(/preview unavailable/i)).toBeNull()

    fireEvent.click(within(dialog).getByRole('button', { name: /download document/i }))

    await waitFor(() => {
      expect(downloadPublicFile).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/resources/7/content`,
        'guide.docx',
      )
    })
  })
})
