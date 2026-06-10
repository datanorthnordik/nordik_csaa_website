import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../constants/api'
import i18n from '../i18n'
import { InMemorialPage } from './InMemorialPage'

const { listMemorials } = vi.hoisted(() => ({
  listMemorials: vi.fn(),
}))

vi.mock('../api/memorialsApi', async () => {
  const actual =
    await vi.importActual<typeof import('../api/memorialsApi')>('../api/memorialsApi')

  return {
    ...actual,
    publicMemorialsApi: {
      ...actual.publicMemorialsApi,
      listMemorials,
    },
  }
})

describe('InMemorialPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('en')

    listMemorials.mockResolvedValue({
      items: [
        {
          id: '7',
          fullName: 'Agnes Wabano',
          affiliation: 'CSAA',
          category: 'friend',
          categoryLabel: 'Friend',
          status: 'published',
          dateOfBirth: '1934-04-01',
          dateOfPassing: '2021-09-02',
          portraitContentUrl: `${API_BASE_URL}/api/memorial/7/portrait/content`,
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        },
        {
          id: '8',
          fullName: 'Samuel Grey',
          affiliation: 'CSAA',
          category: 'friend',
          categoryLabel: 'Friend',
          status: 'published',
          dateOfBirth: '',
          dateOfPassing: '2023-04-11',
          portraitContentUrl: '',
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        },
      ],
      pagination: {
        page: 1,
        pageSize: 100,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      summary: {
        categoryCounts: [],
        statusCounts: [],
      },
      appliedFilters: {
        page: 1,
        pageSize: 100,
        searchTerm: '',
        status: 'published',
        category: '',
        sortBy: 'date_of_passing',
        sortOrder: 'desc',
      },
    })
  })

  it('loads live memorial portraits from the api and requests recent passing dates first', async () => {
    render(<InMemorialPage />)

    await waitFor(() => {
      expect(listMemorials).toHaveBeenCalledWith({
        page: 1,
        pageSize: 100,
        sortBy: 'date_of_passing',
        sortOrder: 'desc',
      })
    })

    const portrait = await screen.findByRole('img', { name: /agnes wabano/i })

    expect(portrait.getAttribute('src')).toBe(
      `${API_BASE_URL}/api/memorial/7/portrait/content`,
    )
    expect(screen.getByText('1934 - 2021')).toBeTruthy()
    expect(screen.queryByRole('img', { name: /samuel grey/i })).toBeNull()
    expect(screen.getByText('Samuel Grey')).toBeTruthy()
  })
})
