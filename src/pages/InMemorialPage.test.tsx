<<<<<<< HEAD
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { InMemorialPage } from './InMemorialPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <InMemorialPage />
    </MemoryRouter>,
  )
}

describe('InMemorialPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  describe('hero section', () => {
    it('renders the in loving, memory heading, and tagline', () => {
      renderPage()

      expect(screen.getByText(/in loving/i)).toBeDefined()
      expect(screen.getByRole('heading', { name: /memory/i })).toBeDefined()
      expect(screen.getByText(/forever in our hearts/i)).toBeDefined()
    })

    it('renders the memorial flower image', () => {
      renderPage()

      expect(screen.getByAltText(/memorial flower arrangement/i)).toBeDefined()
    })
  })

  describe('gallery of remembrance', () => {
    it('renders all four memorial entry names', () => {
      renderPage()

      expect(screen.getByText('Agnes Wabano')).toBeDefined()
      expect(screen.getByText('Samuel Grey')).toBeDefined()
      expect(screen.getByText('David Kee')).toBeDefined()
      expect(screen.getByText('Mary Pine')).toBeDefined()
    })

    it('renders the years for each memorial entry', () => {
      renderPage()

      expect(screen.getByText('1934 – 2021')).toBeDefined()
      expect(screen.getByText('1941 – 2023')).toBeDefined()
      expect(screen.getByText('1945 – 2022')).toBeDefined()
      expect(screen.getByText('1938 – 2020')).toBeDefined()
    })

    it('renders four memorial cards', () => {
      renderPage()

      expect(screen.getAllByRole('article')).toHaveLength(4)
    })
  })

  describe('stories of resilience section', () => {
    it('renders the section eyebrow and heading', () => {
      renderPage()

      expect(screen.getByText(/community echoes/i)).toBeDefined()
      expect(screen.getByRole('heading', { name: /stories of resilience/i })).toBeDefined()
    })

    it('renders both quote texts', () => {
      renderPage()

      expect(
        screen.getByText(/i remember how we used to whisper in the dormitories/i),
      ).toBeDefined()
      expect(
        screen.getByText(/my mother always said that even in the longest winter/i),
      ).toBeDefined()
    })

    it('renders both quote attributions', () => {
      renderPage()

      expect(screen.getByText(/anonymous alumnus, class of '58/i)).toBeDefined()
      expect(screen.getByText(/t\. wabano, community member/i)).toBeDefined()
    })
  })

  describe('remembrance garden section', () => {
    it('renders the garden title and plant button', () => {
      renderPage()

      expect(
        screen.getByRole('heading', { name: /add to the remembrance garden/i }),
      ).toBeDefined()
      expect(screen.getByRole('button', { name: /plant a flower/i })).toBeDefined()
    })

    it('renders the meadow image alongside the flower image', () => {
      const { container } = renderPage()

      // flower (labelled) + meadow (decorative alt="") = 2 img elements
      expect(container.querySelectorAll('img')).toHaveLength(2)
    })

    it('shows no floating flowers before the button is clicked', () => {
      renderPage()

      expect(screen.queryAllByText('✿')).toHaveLength(0)
    })

    it('spawns a floating flower particle when the button is clicked', () => {
      renderPage()

      fireEvent.click(screen.getByRole('button', { name: /plant a flower/i }))

      expect(screen.getAllByText('✿')).toHaveLength(1)
    })

    it('accumulates particles with successive clicks', () => {
      renderPage()

      const btn = screen.getByRole('button', { name: /plant a flower/i })
      fireEvent.click(btn)
      fireEvent.click(btn)
      fireEvent.click(btn)

      expect(screen.getAllByText('✿')).toHaveLength(3)
    })

    it('does not render the count line that was removed', () => {
      renderPage()

      expect(screen.queryByText(/current meadow growth/i)).toBeNull()
      expect(screen.queryByText(/flowers planted/i)).toBeNull()
    })
=======
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
>>>>>>> 0a5998ba9cd949fd00bda62d064ec0b480e53f0c
  })
})
