import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eventsApi, type EventDetailResponse } from '../api/eventsApi'
import i18n from '../i18n'
import { GatheringsPage } from './GatheringsPage'

vi.mock('../api/eventsApi', () => ({
  eventsApi: {
    listUpcomingEvents: vi.fn(),
    listArchivedEvents: vi.fn(),
  },
}))

const listUpcomingEvents = vi.mocked(eventsApi.listUpcomingEvents)
const listArchivedEvents = vi.mocked(eventsApi.listArchivedEvents)
type UpcomingResponse = Awaited<ReturnType<typeof eventsApi.listUpcomingEvents>>
type ArchivedResponse = Awaited<ReturnType<typeof eventsApi.listArchivedEvents>>

function createEvent(
  id: number,
  title: string,
  overrides: Partial<EventDetailResponse> = {},
): EventDetailResponse {
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
    teaser: 'Community event details.',
    description_html: '<p>Community event details.</p>',
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

function createListResponse(
  items: EventDetailResponse[],
  options: {
    page?: number
    totalItems?: number
    totalPages?: number
    hasNext?: boolean
    hasPrev?: boolean
  } = {},
): UpcomingResponse | ArchivedResponse {
  const {
    page = 1,
    totalItems = items.length,
    totalPages = 1,
    hasNext = false,
    hasPrev = false,
  } = options

  return {
    items,
    pagination: {
      page,
      page_size: 10,
      total_items: totalItems,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev,
    },
  }
}

function renderGatheringsPage() {
  return render(
    <MemoryRouter>
      <GatheringsPage />
    </MemoryRouter>,
  )
}

function getSectionByHeading(name: string | RegExp) {
  const heading = screen.getByRole('heading', { name })
  const section = heading.closest('section')

  if (!section) {
    throw new Error(`Could not find section for heading: ${String(name)}`)
  }

  return section
}

describe('GatheringsPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-10T12:00:00-04:00'))
    await i18n.changeLanguage('en')
    listUpcomingEvents.mockReset()
    listArchivedEvents.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows only the first 10 upcoming and archived events until show more is used', async () => {
    const upcomingEvents = Array.from({ length: 12 }, (_, index) =>
      createEvent(index + 1, `Upcoming Event ${index + 1}`),
    )
    const archivedPageOne = Array.from({ length: 10 }, (_, index) =>
      createEvent(index + 101, `Archived Event ${index + 1}`),
    )
    const archivedPageTwo = Array.from({ length: 2 }, (_, index) =>
      createEvent(index + 111, `Archived Event ${index + 11}`),
    )

    listUpcomingEvents.mockResolvedValue(
      createListResponse(upcomingEvents, {
        totalItems: 12,
        totalPages: 2,
        hasNext: true,
      }),
    )
    listArchivedEvents.mockImplementation(async (_referenceDate, page = 1) => {
      if (page === 1) {
        return createListResponse(archivedPageOne, {
          page: 1,
          totalItems: 12,
          totalPages: 2,
          hasNext: true,
        })
      }

      return createListResponse(archivedPageTwo, {
        page: 2,
        totalItems: 12,
        totalPages: 2,
        hasPrev: true,
      })
    })

    renderGatheringsPage()

    const upcomingSection = getSectionByHeading(/upcoming events/i)
    const archiveSection = getSectionByHeading(/preserving our event archive/i)

    await waitFor(() => {
      expect(
        within(upcomingSection).getAllByRole('link', { name: /view event details/i }),
      ).toHaveLength(10)
      expect(
        within(archiveSection).getAllByRole('link', { name: /view event summary/i }),
      ).toHaveLength(10)
    })
    expect(listUpcomingEvents).toHaveBeenCalledWith('2026-09-10')
    expect(listArchivedEvents).toHaveBeenCalledWith('2026-09-09', 1, 10)

    fireEvent.click(within(upcomingSection).getByRole('button', { name: /show more/i }))

    await waitFor(() => {
      expect(
        within(upcomingSection).getAllByRole('link', { name: /view event details/i }),
      ).toHaveLength(12)
    })
    expect(
      within(upcomingSection).queryByRole('button', { name: /show more/i }),
    ).toBeNull()

    fireEvent.click(within(archiveSection).getByRole('button', { name: /show more/i }))

    await waitFor(() => {
      expect(listArchivedEvents).toHaveBeenLastCalledWith('2026-09-09', 2, 10)
      expect(
        within(archiveSection).getAllByRole('link', { name: /view event summary/i }),
      ).toHaveLength(12)
    })
    expect(
      within(archiveSection).queryByRole('button', { name: /show more/i }),
    ).toBeNull()
  })

  it('hides the show more button when a section has 10 or fewer events', async () => {
    listUpcomingEvents.mockResolvedValue(
      createListResponse(
        Array.from({ length: 10 }, (_, index) =>
          createEvent(index + 1, `Upcoming Event ${index + 1}`),
        ),
      ),
    )
    listArchivedEvents.mockResolvedValue(
      createListResponse(
        Array.from({ length: 10 }, (_, index) =>
          createEvent(index + 101, `Archived Event ${index + 1}`),
        ),
      ),
    )

    renderGatheringsPage()

    expect(
      await screen.findByRole('heading', { name: /upcoming events/i }),
    ).toBeDefined()

    const upcomingSection = getSectionByHeading(/upcoming events/i)
    const archiveSection = getSectionByHeading(/preserving our event archive/i)

    expect(
      within(upcomingSection).queryByRole('button', { name: /show more/i }),
    ).toBeNull()
    expect(
      within(archiveSection).queryByRole('button', { name: /show more/i }),
    ).toBeNull()
  })
})
