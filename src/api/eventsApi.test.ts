import { beforeEach, describe, expect, it, vi } from 'vitest'
import { eventsApi, type EventListItem } from './eventsApi'
import { apiClient } from './apiClient'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

function createEvent(id: number, title: string): EventListItem {
  return {
    id,
    title,
    show_title: true,
    categories: ['Gathering'],
    status: 'published',
    event_type: 'single_day_partial',
    start_at: '2026-09-19T10:00:00-04:00',
    end_at: '2026-09-19T15:00:00-04:00',
    date_display: '',
    privacy_type: 'public',
    private_audiences: [],
    published: true,
    request_review: false,
    review_email_list: [],
    teaser: '',
    description_html: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_ext: '',
    contact_fax: '',
    location_mode: 'none',
    address: null,
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
  }
}

describe('eventsApi', () => {
  beforeEach(() => {
    apiGet.mockReset()
  })

  it('fetches an upcoming-events page from the list API only', async () => {
    const upcomingEvents = [
      createEvent(1, 'Opening Circle'),
      createEvent(2, 'Closing Circle'),
    ]

    apiGet.mockImplementation(async (url, config) => {
      if (url !== '/api/events') {
        throw new Error(`unexpected request: ${String(url)}`)
      }

      const params = config?.params as URLSearchParams
      expect(params.get('start_date')).toBe('2026-09-01')
      expect(params.get('sort_order')).toBe('asc')
      expect(params.get('page')).toBe('1')
      expect(params.get('page_size')).toBe('10')

      return {
        data: {
          items: upcomingEvents,
          pagination: {
            page: 1,
            page_size: 10,
            total_items: 2,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          },
        },
      }
    })

    const response = await eventsApi.listUpcomingEvents('2026-09-01')

    expect(response.items.map((event) => event.title)).toEqual([
      'Opening Circle',
      'Closing Circle',
    ])
    expect(apiGet).toHaveBeenCalledTimes(1)
  })

  it('fetches archived events from the list API only', async () => {
    const archivedEvent = createEvent(3, 'Archived Gathering')

    apiGet.mockImplementation(async (url, config) => {
      if (url !== '/api/events') {
        throw new Error(`unexpected request: ${String(url)}`)
      }

      const params = config?.params as URLSearchParams
      expect(params.get('end_date')).toBe('2026-08-31')
      expect(params.get('sort_order')).toBe('desc')
      expect(params.get('page')).toBe('2')
      expect(params.get('page_size')).toBe('10')

      return {
        data: {
          items: [archivedEvent],
          pagination: {
            page: 2,
            page_size: 10,
            total_items: 11,
            total_pages: 2,
            has_next: false,
            has_prev: true,
          },
        },
      }
    })

    const response = await eventsApi.listArchivedEvents('2026-08-31', 2, 10)

    expect(response.items.map((event) => event.title)).toEqual(['Archived Gathering'])
    expect(apiGet).toHaveBeenCalledTimes(1)
  })

  it('fetches all date-range pages from the list API without per-item detail calls', async () => {
    const firstEvent = createEvent(4, 'Opening Circle')
    const secondEvent = createEvent(5, 'Closing Circle')

    apiGet.mockImplementation(async (url, config) => {
      if (url !== '/api/events') {
        throw new Error(`unexpected request: ${String(url)}`)
      }

      const params = config?.params as URLSearchParams
      expect(params.get('page_size')).toBe('100')
      expect(params.get('start_date')).toBe('2026-08-30')
      expect(params.get('end_date')).toBe('2026-10-03')

      if (params.get('page') === '2') {
        return {
          data: {
            items: [secondEvent],
            pagination: {
              page: 2,
              page_size: 100,
              total_items: 2,
              total_pages: 2,
              has_next: false,
              has_prev: true,
            },
          },
        }
      }

      expect(params.get('page')).toBeNull()

      return {
        data: {
          items: [firstEvent],
          pagination: {
            page: 1,
            page_size: 100,
            total_items: 2,
            total_pages: 2,
            has_next: true,
            has_prev: false,
          },
        },
      }
    })

    const response = await eventsApi.listEventsByDateRange('2026-08-30', '2026-10-03')

    expect(response.items.map((event) => event.title)).toEqual([
      'Opening Circle',
      'Closing Circle',
    ])
    expect(apiGet).toHaveBeenCalledTimes(2)
  })
})
