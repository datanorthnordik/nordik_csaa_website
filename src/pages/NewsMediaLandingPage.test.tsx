import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { NewsMediaLandingPage } from './NewsMediaLandingPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <NewsMediaLandingPage />
    </MemoryRouter>,
  )
}

describe('NewsMediaLandingPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  describe('hero section', () => {
    it('renders the page heading and description', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: /news & media/i })).toBeDefined()
      expect(
        screen.getByText(/stay informed with updates from our community/i),
      ).toBeDefined()
    })
  })

  describe('feature cards', () => {
    it('renders the digital newsletter card with title and description', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: /digital newsletter/i })).toBeDefined()
      expect(
        screen.getByText(/read our latest community updates, stories, and upcoming events/i),
      ).toBeDefined()
    })

    it('links the newsletter action to the digital newsletter page', () => {
      renderPage()

      const link = screen.getByRole('link', { name: /read latest edition/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/news-media/digital-newsletter')
    })

    it('renders the press archive card with title and description', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: /press archive/i })).toBeDefined()
      expect(screen.getByText(/browse external media coverage/i)).toBeDefined()
    })

    it('links the press archive action to the press archive page', () => {
      renderPage()

      const link = screen.getByRole('link', { name: /view press archive/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/news-media/press-archive')
    })
  })

  describe('press inquiries section', () => {
    it('renders the press inquiries heading and description', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: /press inquiries/i })).toBeDefined()
      expect(
        screen.getByText(/for media requests, interview opportunities/i),
      ).toBeDefined()
    })

    it('renders the reach out link pointing to the contact page', () => {
      renderPage()

      const link = screen.getByRole('link', { name: /reach out/i })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/contact')
    })

    it('renders the press image with accessible label', () => {
      renderPage()

      expect(
        screen.getByRole('img', { name: /press and media equipment/i }),
      ).toBeDefined()
    })
  })

  describe('french locale', () => {
    it('renders translated headings in french', async () => {
      await i18n.changeLanguage('fr')
      renderPage()

      expect(screen.getByRole('heading', { name: /nouvelles et médias/i })).toBeDefined()
      expect(screen.getByRole('heading', { name: /demandes des médias/i })).toBeDefined()
    })
  })
})
