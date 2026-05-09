import { beforeEach, describe, expect, it, vi } from 'vitest'
import { eventsApi, type EventDetailResponse } from './eventsApi'
import { apiClient } from './apiClient'

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const apiGet = vi.mocked(apiClient.get)

function createEvent(id: number, title: string): EventDetailResponse {
  return {
    id,
    title,
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

  it('fetches all date-range pages without sending page_size', async () => {
    const firstEvent = createEvent(1, 'Opening Circle')
    const secondEvent = createEvent(2, 'Closing Circle')

    apiGet.mockImplementation(async (url, config) => {
      if (url === '/api/events') {
        const params = config?.params as URLSearchParams
        expect(params.get('page_size')).toBeNull()

        if (params.get('page') === '2') {
          return {
            data: {
              items: [{ id: secondEvent.id }],
              pagination: {
                page: 2,
                page_size: 20,
                total_items: 2,
                total_pages: 2,
                has_next: false,
                has_prev: true,
              },
            },
          }
        }

        expect(params.get('start_date')).toBe('2026-08-30')
        expect(params.get('end_date')).toBe('2026-10-03')
        expect(params.get('page')).toBeNull()

        return {
          data: {
            items: [{ id: firstEvent.id }],
            pagination: {
              page: 1,
              page_size: 20,
              total_items: 2,
              total_pages: 2,
              has_next: true,
              has_prev: false,
            },
          },
        }
      }

      return {
        data: url === '/api/events/1' ? firstEvent : secondEvent,
      }
    })

    const response = await eventsApi.listEventsByDateRange('2026-08-30', '2026-10-03')

    expect(response.items.map((event) => event.title)).toEqual([
      'Opening Circle',
      'Closing Circle',
    ])
  })
})
