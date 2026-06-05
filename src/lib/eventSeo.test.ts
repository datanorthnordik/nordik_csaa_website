import { describe, expect, it } from 'vitest'
import type { EventDetailResponse } from '../api/eventsApi'
import { buildEventListSchema, buildEventSchema } from './eventSeo'

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

describe('eventSeo', () => {
  it('normalizes all-day event dates and includes richer organizer and offer fields', () => {
    const siteRoot = new URL('/', window.location.origin).toString()
    const schema = buildEventSchema(
      createEvent({
        event_type: 'multi_day_all_day',
        start_at: '2026-09-19T00:00:00-04:00',
        end_at: '2026-09-21T23:59:59-04:00',
        registration_enabled: true,
        registration_url: 'https://events.example.com/register',
        registration_start_at: '2026-07-01T09:00:00-04:00',
      }),
      {
        canonicalPath: '/events/101',
      },
    )

    expect(schema).toBeDefined()
    expect(schema?.startDate).toBe('2026-09-19')
    expect(schema?.endDate).toBe('2026-09-21')
    expect(schema?.mainEntityOfPage).toBe(`${siteRoot}events/101`)
    expect((schema?.organizer as Record<string, unknown>).url).toBe(siteRoot)
    expect((schema?.offers as Record<string, unknown>).url).toBe(
      'https://events.example.com/register',
    )
  })

  it('returns no event schema when the page cannot provide a physical event location', () => {
    const schema = buildEventSchema(
      createEvent({
        location_mode: 'none',
        address: null,
      }),
    )

    expect(schema).toBeUndefined()
  })

  it('filters incomplete events out of collection schema item lists', () => {
    const schema = buildEventListSchema({
      title: 'Events',
      description: 'Upcoming and archived events.',
      canonicalPath: '/events',
      events: [
        createEvent({ id: 1, title: 'Valid Event' }),
        createEvent({
          id: 2,
          title: 'Location Pending Event',
          location_mode: 'to_be_determined',
          address: null,
        }),
      ],
    })

    expect(schema.mainEntity).toBeDefined()
    expect(
      (schema.mainEntity as Record<string, unknown>).numberOfItems,
    ).toBe(1)
    expect(
      ((schema.mainEntity as Record<string, unknown>).itemListElement as Array<Record<string, unknown>>)
        [0].position,
    ).toBe(1)
  })
})
