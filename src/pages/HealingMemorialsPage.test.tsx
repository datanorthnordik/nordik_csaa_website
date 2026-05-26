import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { HealingMemorialsPage } from './HealingMemorialsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <HealingMemorialsPage />
    </MemoryRouter>,
  )
}

describe('HealingMemorialsPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  describe('hero section', () => {
    it('renders the page title and description', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: /healing & memorials/i })).toBeDefined()
      expect(screen.getByText(/we honor the resilience and spirit/i)).toBeDefined()
    })

    it('renders the explore memorials CTA linking to the pillars anchor', () => {
      renderPage()

      const cta = screen.getByRole('link', { name: /explore memorials/i })
      expect(cta).toBeDefined()
      expect(cta.getAttribute('href')).toBe('#pillars')
    })
  })

  describe('community pillars section', () => {
    it('renders the section eyebrow and heading', () => {
      renderPage()

      expect(screen.getByText(/our path forward/i)).toBeDefined()
      expect(screen.getByRole('heading', { name: /community pillars/i })).toBeDefined()
    })

    it('renders all five pillar card titles', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: /^in memorial$/i })).toBeDefined()
      expect(screen.getByRole('heading', { name: /shingwauk hall exhibition/i })).toBeDefined()
      expect(screen.getByRole('heading', { name: /every child matters/i })).toBeDefined()
      expect(screen.getByRole('heading', { name: /crying rock/i })).toBeDefined()
      expect(screen.getByRole('heading', { name: /wawanosh memorial project/i })).toBeDefined()
    })

    it('links In Memorial card to the correct route', () => {
      renderPage()

      const links = screen
        .getAllByRole('link')
        .filter((l) => l.getAttribute('href') === '/our-story/healing-memorials/in-memorial')
      expect(links.length).toBeGreaterThan(0)
    })

    it('links Shingwauk Hall Exhibition card to the correct route', () => {
      renderPage()

      const links = screen
        .getAllByRole('link')
        .filter(
          (l) =>
            l.getAttribute('href') ===
            '/our-story/healing-memorials/shingwauk-hall-exhibition',
        )
      expect(links.length).toBeGreaterThan(0)
    })

    it('links Every Child Matters card to the correct route', () => {
      renderPage()

      const links = screen
        .getAllByRole('link')
        .filter(
          (l) =>
            l.getAttribute('href') ===
            '/our-story/healing-memorials/every-child-matters',
        )
      expect(links.length).toBeGreaterThan(0)
    })

    it('links Crying Rock card to the correct route', () => {
      renderPage()

      const links = screen
        .getAllByRole('link')
        .filter(
          (l) => l.getAttribute('href') === '/our-story/healing-memorials/crying-rock',
        )
      expect(links.length).toBeGreaterThan(0)
    })

    it('links Wawanosh Memorial Project card to the correct route', () => {
      renderPage()

      const links = screen
        .getAllByRole('link')
        .filter(
          (l) =>
            l.getAttribute('href') ===
            '/our-story/healing-memorials/wawanosh-memorial-project',
        )
      expect(links.length).toBeGreaterThan(0)
    })

    it('renders a Learn More link for every pillar card', () => {
      renderPage()

      expect(screen.getAllByRole('link', { name: /learn more/i })).toHaveLength(5)
    })

    it('renders descriptions for every pillar card', () => {
      renderPage()

      expect(screen.getByText(/honoring the memory of those we have lost/i)).toBeDefined()
      expect(screen.getByText(/explore the physical and virtual exhibition/i)).toBeDefined()
      expect(screen.getByText(/join the movement for truth and reconciliation/i)).toBeDefined()
      expect(screen.getByText(/discover the spiritual significance of the crying rock/i)).toBeDefined()
      expect(screen.getByText(/honouring the legacy of the wawanosh/i)).toBeDefined()
    })
  })

  describe('support section', () => {
    it('renders the support heading and description', () => {
      renderPage()

      expect(
        screen.getByRole('heading', { name: /support our healing journey/i }),
      ).toBeDefined()
      expect(
        screen.getByText(/relies on your support to maintain these memorials/i),
      ).toBeDefined()
    })

    it('renders donate and join action links', () => {
      renderPage()

      expect(screen.getByRole('link', { name: /donate today/i })).toBeDefined()
      expect(screen.getByRole('link', { name: /join the association/i })).toBeDefined()
    })
  })
})
