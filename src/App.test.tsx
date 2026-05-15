import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import i18n from './i18n'
import { createAppStore } from './store/store'

const {
  getEvent,
  getMainMenu,
  listUpcomingEvents,
  listArchivedEvents,
  listEventsByDateRange,
} = vi.hoisted(() => ({
  getMainMenu: vi.fn(),
  listUpcomingEvents: vi.fn(),
  listArchivedEvents: vi.fn(),
  listEventsByDateRange: vi.fn(),
  getEvent: vi.fn(),
}))

vi.mock('./api/menusApi', () => ({
  menusApi: {
    getMainMenu,
  },
}))

vi.mock('./api/eventsApi', () => ({
  eventsApi: {
    listUpcomingEvents,
    listArchivedEvents,
    listEventsByDateRange,
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

const sampleMenu = {
  id: 1,
  menu_key: 'main',
  name: 'Main Website Navigation',
  items: [
    {
      id: 18,
      parent_id: null,
      label: 'Home',
      navigation_type: 'pages',
      page_id: 1,
      external_url: '',
      open_in_new_tab: false,
      sort_order: 0,
      href: '/home',
      page_type: 'page',
      page: {
        id: 1,
        page_title: 'Home',
        url_slug: '/home',
        parent_id: null,
        page_type: 'page',
        status: 'published',
      },
      children: [
        {
          id: 20,
          parent_id: 18,
          label: 'Contact Us',
          navigation_type: 'pages',
          page_id: 7,
          external_url: '',
          open_in_new_tab: false,
          sort_order: 1,
          href: '/home/contact-us',
          page_type: 'page',
          page: {
            id: 7,
            page_title: 'Contact Us',
            url_slug: '/home/contact-us',
            parent_id: 1,
            page_type: 'page',
            status: 'published',
          },
          children: [],
        },
      ],
    },
    {
      id: 21,
      parent_id: null,
      label: 'Events',
      navigation_type: 'pages',
      page_id: 8,
      external_url: '',
      open_in_new_tab: false,
      sort_order: 1,
      href: '/events',
      page_type: 'module',
      page: {
        id: 8,
        page_title: 'Events',
        url_slug: '/events',
        parent_id: null,
        page_type: 'module',
        status: 'published',
      },
      children: [],
    },
  ],
}

beforeEach(async () => {
  getMainMenu.mockReset()
  listUpcomingEvents.mockReset()
  listArchivedEvents.mockReset()
  listEventsByDateRange.mockReset()
  getMainMenu.mockResolvedValue(sampleMenu)
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
  listEventsByDateRange.mockResolvedValue({
    items: [sampleUpcomingEvent],
    pagination: {
      page: 1,
      page_size: 100,
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
  it('redirects to the first internal menu slug and shows the coming soon page', async () => {
    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /^home$/i,
      }),
    ).toBeDefined()
    expect(window.location.pathname).toBe('/home')
    expect(
      within(screen.getByRole('navigation')).getByRole('link', { name: /^home$/i })
        .getAttribute('aria-current'),
    ).toBe('page')
    expect(
      within(screen.getByRole('navigation')).getByRole('link', { name: /^events$/i }),
    ).toBeDefined()
    expect(screen.getByRole('button', { name: 'FR' })).toBeDefined()
  })

  it('switches the shared coming soon copy to french', async () => {
    renderWithProviders(<App />)

    await screen.findByRole('heading', { name: /^home$/i })

    fireEvent.click(screen.getByRole('button', { name: 'FR' }))

    expect(await screen.findByText(/bientot disponible/i)).toBeDefined()
  })

  it('renders the event calendar page and keeps the events item active', async () => {
    window.history.pushState({}, '', '/events/calendar')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /community calendar/i,
      }),
    ).toBeDefined()
    expect(
      within(screen.getByRole('navigation')).getByRole('link', { name: /^events$/i })
        .getAttribute('aria-current'),
    ).toBe('page')
    expect(listEventsByDateRange).toHaveBeenCalled()
  })

  it('keeps the parent menu item active for child slugs', async () => {
    window.history.pushState({}, '', '/home/contact-us')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /contact us/i,
      }),
    ).toBeDefined()
    expect(
      within(screen.getByRole('navigation')).getByRole('link', { name: /^home$/i })
        .getAttribute('aria-current'),
    ).toBe('page')
  })
})
