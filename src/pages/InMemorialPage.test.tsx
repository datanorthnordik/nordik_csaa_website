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
  })
})
