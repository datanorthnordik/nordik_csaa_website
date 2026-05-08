import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import i18n from './i18n'
import { createAppStore } from './store/store'

const { getEvent, listUpcomingEvents, listArchivedEvents } = vi.hoisted(() => ({
  listUpcomingEvents: vi.fn(),
  listArchivedEvents: vi.fn(),
  getEvent: vi.fn(),
}))

vi.mock('./api/eventsApi', () => ({
  eventsApi: {
    listUpcomingEvents,
    listArchivedEvents,
    getEvent,
  },
}))

function renderWithProviders(ui: ReactElement) {
  const store = createAppStore()
  return render(<Provider store={store}>{ui}</Provider>)
}

const sampleUpcomingEvent = {
  id: 101,
  title: 'Elders Council Circle',
  show_title: true,
  categories: ['Gathering'],
  event_type: 'single_day_partial',
  start_at: '2026-09-19T10:00:00-04:00',
  end_at: '2026-09-19T15:00:00-04:00',
  date_display: '2026-09-19 10:00 - 2026-09-19 15:00',
  privacy_type: 'public',
  private_audiences: [],
  published: true,
  request_review: false,
  review_email_list: [],
  teaser: 'Join us for a day of storytelling and community wisdom.',
  description_html: '<p>Join us for a day of storytelling and community wisdom.</p>',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  contact_ext: '',
  contact_fax: '',
  location_mode: 'address',
  address: {
    id: 12,
    name: 'Heritage Valley Grounds',
    address_line_1: '100 River Road',
    address_line_2: '',
    city: 'Toronto',
    province_state: 'ON',
    postal_code: 'M1M1M1',
    country: 'Canada',
    is_saved: true,
    created_at: '',
    updated_at: '',
  },
  show_display_image_when_viewing: true,
  gallery_id: null,
  registration_enabled: true,
  registration_start_at: '2026-07-01T09:00:00-04:00',
  registration_end_at: '2026-09-15T17:00:00-04:00',
  registration_url: 'https://example.com/register',
  repeat_enabled: false,
  recurrence_type: null,
  recurrence_frequency: null,
  recurrence_interval: 1,
  recurrence_until: null,
  recurrence_rule: null,
  occurrences: [],
  display_image: null,
  attachments: [],
  created_by: null,
  created_at: '',
  updated_at: '',
}

const sampleArchiveEvent = {
  ...sampleUpcomingEvent,
  id: 88,
  title: 'Summer Solstice Gathering',
  start_at: '2025-06-21T18:00:00-04:00',
  end_at: '2025-06-21T21:00:00-04:00',
  teaser: 'A celebration of community songs, stories, and shared meals.',
  registration_enabled: false,
  registration_start_at: null,
  registration_end_at: null,
  registration_url: '',
}

beforeEach(async () => {
  listUpcomingEvents.mockReset()
  listArchivedEvents.mockReset()
  listUpcomingEvents.mockResolvedValue({
    items: [sampleUpcomingEvent],
    pagination: {
      page: 1,
      page_size: 10,
      total_items: 1,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  })
  listArchivedEvents.mockResolvedValue({
    items: [sampleArchiveEvent],
    pagination: {
      page: 1,
      page_size: 10,
      total_items: 1,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  })

  window.localStorage.clear()
  window.sessionStorage.clear()
  window.history.pushState({}, '', '/')
  await i18n.changeLanguage('en')
})

describe('App', () => {
  it('renders the gatherings landing page by default', async () => {
    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /explore the journey: our past & future events/i,
      }),
    ).toBeDefined()
    expect(screen.getByRole('link', { name: /gatherings/i })).toBeDefined()
    expect(screen.getByRole('button', { name: 'FR' })).toBeDefined()
  })

  it('switches the gatherings page copy to french', async () => {
    renderWithProviders(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'FR' }))

    expect(
      await screen.findByRole('heading', {
        name: /explorez le parcours : nos evenements passes et futurs/i,
      }),
    ).toBeDefined()
    expect(screen.getByRole('link', { name: /voir a venir/i })).toBeDefined()
  })
})
