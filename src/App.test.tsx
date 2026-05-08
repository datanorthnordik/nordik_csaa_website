import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import i18n from './i18n'
import { createAppStore } from './store/store'

function renderWithProviders(ui: ReactElement) {
  const store = createAppStore()
  return render(<Provider store={store}>{ui}</Provider>)
}

beforeEach(async () => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  window.history.pushState({}, '', '/')
  await i18n.changeLanguage('en')
})

describe('App', () => {
  it('renders the translated website shell by default', () => {
    renderWithProviders(<App />)

    expect(
      screen.getByRole('heading', {
        name: /bilingual ui, shared toasts, and api plumbing are now part of this website/i,
      }),
    ).toBeDefined()
    expect(screen.getByRole('button', { name: 'FR' })).toBeDefined()
  })

  it('switches the homepage copy to french', async () => {
    renderWithProviders(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'FR' }))

    expect(
      await screen.findByRole('heading', {
        name: /l interface bilingue, les toasts partages et la logique api font maintenant partie du site/i,
      }),
    ).toBeDefined()
    expect(screen.getByRole('button', { name: /apercu du toast/i })).toBeDefined()
  })
})
