import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eventsApi, type EventDetailResponse } from '../api/eventsApi'
import i18n from '../i18n'
import { EventCalendarPage } from './EventCalendarPage'

vi.mock('../api/eventsApi', () => ({
  eventsApi: {
    listEventsByDateRange: vi.fn(),
  },
}))

const listEventsByDateRange = vi.mocked(eventsApi.listEventsByDateRange)
type DateRangeResponse = Awaited<ReturnType<typeof eventsApi.listEventsByDateRange>>

function createEvent(
  overrides: Partial<EventDetailResponse> = {},
): EventDetailResponse {
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
    teaser: 'Community wisdom and storytelling.',
    description_html: '',
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

function renderCalendar() {
  window.history.pushState({}, '', '/events/calendar')
  return render(
    <MemoryRouter>
      <EventCalendarPage />
    </MemoryRouter>,
  )
}

function createDateRangeResponse(items: EventDetailResponse[]): DateRangeResponse {
  return {
    items,
    pagination: {
      page: 1,
      page_size: 20,
      total_items: items.length,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  }
}

describe('EventCalendarPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-10T12:00:00-04:00'))
    await i18n.changeLanguage('en')
    listEventsByDateRange.mockReset()
    listEventsByDateRange.mockResolvedValue(
      createDateRangeResponse([
        createEvent({
          id: 101,
          title: 'Seven Day Teaching',
          categories: ['Gathering'],
          event_type: 'multi_day_all_day',
          start_at: '2026-09-08',
          end_at: '2026-09-14',
        }),
        createEvent({
          id: 102,
          title: 'Beading Workshop',
          categories: ['Workshop'],
          start_at: '2026-09-20T10:00:00-04:00',
          end_at: '2026-09-20T12:00:00-04:00',
        }),
        createEvent({
          id: 103,
          title: 'Ceremony Drum Circle',
          categories: ['Ceremony'],
          start_at: '2026-09-22T18:00:00-04:00',
          end_at: '2026-09-22T20:00:00-04:00',
        }),
      ]),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads the visible month range', async () => {
    renderCalendar()

    expect(
      await screen.findByRole('heading', { name: /community calendar/i }),
    ).toBeDefined()
    expect(listEventsByDateRange).toHaveBeenCalledWith('2026-08-30', '2026-10-03')
    expect(document.title).toBe('Events Calendar | Children of Shingwauk Alumni Association')
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(
      'Browse the CSAA events calendar to find upcoming community gatherings, workshops, and ceremonies by month.',
    )
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(
      /\/events\/calendar$/,
    )
  })

  it('filters events by category', async () => {
    renderCalendar()

    expect(await screen.findAllByText(/beading workshop/i)).not.toHaveLength(0)

    fireEvent.click(screen.getByLabelText('Ceremony'))

    await waitFor(() => {
      expect(screen.queryByText(/beading workshop/i)).toBeNull()
    })
    expect(screen.getAllByText(/ceremony drum circle/i)).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: /clear all/i })).toHaveLength(2)
  })

  it('switches to the list view', async () => {
    renderCalendar()

    await screen.findAllByText(/seven day teaching/i)
    fireEvent.click(screen.getByRole('button', { name: /^list$/i }))

    expect(
      screen.getAllByRole('link', { name: /view details/i })[0].getAttribute('href'),
    ).toBe('/events/101')

    fireEvent.click(screen.getByRole('button', { name: /^month$/i }))

    expect(screen.getByText(/events shown: 3/i)).toBeDefined()
  })

  it('supports month navigation, today reset, toggled filters, and clearing filters', async () => {
    renderCalendar()

    expect(await screen.findAllByText(/ceremony drum circle/i)).not.toHaveLength(0)

    fireEvent.click(screen.getByLabelText('Workshop'))

    await waitFor(() => {
      expect(screen.queryByText(/ceremony drum circle/i)).toBeNull()
    })

    fireEvent.click(screen.getByLabelText('Workshop'))

    expect(await screen.findAllByText(/ceremony drum circle/i)).not.toHaveLength(0)

    fireEvent.click(screen.getByLabelText('Ceremony'))

    await waitFor(() => {
      expect(screen.queryByText(/beading workshop/i)).toBeNull()
    })

    fireEvent.click(screen.getAllByRole('button', { name: /clear all/i })[0])

    expect(await screen.findAllByText(/beading workshop/i)).not.toHaveLength(0)

    fireEvent.click(screen.getByTitle('Next'))

    await waitFor(() => {
      expect(listEventsByDateRange).toHaveBeenLastCalledWith(
        '2026-09-27',
        '2026-10-31',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: /today/i }))

    await waitFor(() => {
      expect(listEventsByDateRange).toHaveBeenLastCalledWith(
        '2026-08-30',
        '2026-10-03',
      )
    })
  })

  it('shows the list loading state while events are still loading', () => {
    listEventsByDateRange.mockReturnValueOnce(
      new Promise<DateRangeResponse>(() => undefined),
    )

    renderCalendar()

    fireEvent.click(screen.getByRole('button', { name: /^list$/i }))

    expect(screen.getByText(/loading calendar events/i)).toBeDefined()
  })

  it('shows an empty list state when list view has no events', async () => {
    listEventsByDateRange.mockResolvedValueOnce(createDateRangeResponse([]))

    renderCalendar()

    expect(
      await screen.findByText(/no events match this calendar view/i),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /^list$/i }))

    expect(screen.getByText(/no events to list/i)).toBeDefined()
  })

  it('shows an empty state for a category with no matching visible events', async () => {
    listEventsByDateRange.mockResolvedValueOnce(
      createDateRangeResponse([
        createEvent({
          id: 104,
          title: 'October Planning Meeting',
          categories: ['Meeting'],
          start_at: '2026-10-10T10:00:00-04:00',
          end_at: '2026-10-10T11:00:00-04:00',
        }),
      ]),
    )

    renderCalendar()

    expect(
      await screen.findByText(/no events match this calendar view/i),
    ).toBeDefined()
  })

  it('spans repeat events on the calendar and summarizes overflow items', async () => {
    const overflowEvents = [
      createEvent({
        id: 200,
        title: 'Weekly Youth Circle',
        repeat_enabled: true,
        occurrences: [
          {
            id: 501,
            event_id: 200,
            occurrence_start_at: '2026-09-20T09:00:00-04:00',
            occurrence_end_at: '2026-09-20T10:00:00-04:00',
            occurrence_kind: 'generated',
            created_at: '',
            updated_at: '',
          },
        ],
      }),
      createEvent({
        id: 201,
        title: 'Three Day Teaching',
        event_type: 'multi_day_all_day',
        start_at: '2026-09-20',
        end_at: '2026-09-22',
      }),
      ...Array.from({ length: 4 }, (_, index) => {
        const day = String(21 + index).padStart(2, '0')

        return createEvent({
          id: 210 + index,
          title: `Harvest Circle ${index + 1}`,
          start_at: `2026-09-${day}T10:00:00-04:00`,
          end_at: `2026-09-${day}T11:00:00-04:00`,
        })
      }),
    ]

    listEventsByDateRange.mockResolvedValueOnce(
      createDateRangeResponse(overflowEvents),
    )

    renderCalendar()

    expect(await screen.findAllByText(/weekly youth circle/i)).not.toHaveLength(0)
    expect(screen.getAllByText(/three day teaching/i)).not.toHaveLength(0)
    expect(screen.getByText('+2')).toBeDefined()
  })

  it('shows API error messages and the fallback error text', async () => {
    listEventsByDateRange.mockRejectedValueOnce(new Error('Calendar service down'))

    const { unmount } = renderCalendar()

    expect(await screen.findByText(/calendar service down/i)).toBeDefined()

    unmount()
    listEventsByDateRange.mockRejectedValueOnce('network failed')

    renderCalendar()

    expect(
      await screen.findByText(/we could not load calendar events right now/i),
    ).toBeDefined()
  })

  it('keeps invalid all-day event dates visible by falling back to the current day', async () => {
    listEventsByDateRange.mockResolvedValueOnce(
      createDateRangeResponse([
        createEvent({
          id: 401,
          title: 'Date Pending Ceremony',
          event_type: 'multi_day_all_day',
          start_at: 'date pending',
          end_at: null,
        }),
        createEvent({
          id: 402,
          title: 'Time Pending Workshop',
          event_type: 'single_day_partial',
          start_at: 'time pending',
          end_at: null,
        }),
      ]),
    )

    renderCalendar()

    expect(await screen.findAllByText(/date pending ceremony/i)).not.toHaveLength(0)
    expect(screen.getAllByText(/time pending workshop/i)).not.toHaveLength(0)
  })
})
