import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { eventsApi, type EventDetailResponse } from '../api/eventsApi'
import i18n from '../i18n'
import { EventDetailPage } from './EventDetailPage'

vi.mock('../api/eventsApi', () => ({
  eventsApi: {
    getEvent: vi.fn(),
  },
}))

const getEvent = vi.mocked(eventsApi.getEvent)

function createEvent(overrides: Partial<EventDetailResponse> = {}): EventDetailResponse {
  return {
    id: 101,
    title: 'Elders Council Circle',
    show_title: true,
    categories: ['Gathering'],
    event_type: 'single_day_partial',
    start_at: '2026-09-19T10:00:00-04:00',
    end_at: '2026-09-19T15:00:00-04:00',
    date_display: '',
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
    registration_enabled: false,
    registration_start_at: null,
    registration_end_at: null,
    registration_url: '',
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
    ...overrides,
  }
}

function renderPage(path = '/events/101') {
  window.history.pushState({}, '', path)

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events/:eventId" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EventDetailPage', () => {
  beforeEach(async () => {
    getEvent.mockReset()
    await i18n.changeLanguage('en')
  })

  it('renders the event details and sets event SEO metadata', async () => {
    getEvent.mockResolvedValue(createEvent())

    renderPage()

    expect(
      await screen.findByRole('heading', { name: /elders council circle/i }),
    ).toBeDefined()
    expect(document.title).toBe(
      'Elders Council Circle | Events | Children of Shingwauk Alumni Association',
    )
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe('Join us for a day of storytelling and community wisdom.')
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(
      /\/events\/101$/,
    )

    const structuredData = JSON.parse(
      document.querySelector('script[data-page-seo="structured-data"]')?.textContent ?? '{}',
    )
    expect(structuredData['@type']).toBe('Event')
    expect(structuredData.name).toBe('Elders Council Circle')
    expect(structuredData.url).toMatch(/\/events\/101$/)
  })

  it('marks invalid event routes as noindex', async () => {
    renderPage('/events/not-a-number')

    expect(
      await screen.findByRole('heading', { name: /this event link is not valid/i }),
    ).toBeDefined()
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    )
    expect(getEvent).not.toHaveBeenCalled()
  })
})
