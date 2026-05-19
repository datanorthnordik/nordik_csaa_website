import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import i18n from './i18n'
import { createAppStore } from './store/store'

const {
  getEvent,
  getGallery,
  getMainMenu,
  getPageBySlug,
  listUpcomingEvents,
  listArchivedEvents,
  listEventsByDateRange,
} = vi.hoisted(() => ({
  getMainMenu: vi.fn(),
  getPageBySlug: vi.fn(),
  getGallery: vi.fn(),
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

vi.mock('./api/pagesApi', () => ({
  pagesApi: {
    getPageBySlug,
  },
}))

vi.mock('./api/galleriesApi', () => ({
  galleriesApi: {
    getGallery,
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

const sampleHomePage = {
  id: 1,
  page_title: 'CSAA Newsletter',
  url_slug: '/home',
  parent_id: null,
  page_type: 'page',
  status: 'published',
  hero_image_enabled: false,
  hero_image_url: '',
  hero_image_object_key: '',
  hero_image_fetch_url: '',
  seo_page_title: 'CSAA Newsletter',
  seo_page_description: 'Stories, updates, and shared moments from the community.',
  created_at: '',
  updated_at: '',
  page_detail: {
    id: 1,
    page_id: 1,
    template_key: 'default',
    settings: {},
    schema_version: 1,
    sections: [
      {
        id: 11,
        section_name: 'Header Module',
        section_type: 'header',
        sort_order: 0,
        is_enabled: true,
        settings: {},
        header: {
          main_header_text: 'Welcome to the CSAA newsletter',
          sub_header_text: 'Stories, updates, and shared moments from the community.',
          hierarchy: 'h1_hero',
        },
      },
      {
        id: 12,
        section_name: 'Typography',
        section_type: 'typography',
        sort_order: 1,
        is_enabled: true,
        settings: {},
        typography: {
          html_content:
            '<p>The newsletter shares community updates, stories, and upcoming opportunities.</p>',
          text_content: '',
          text_align: 'left',
        },
      },
      {
        id: 13,
        section_name: 'Gallery Module',
        section_type: 'gallery',
        sort_order: 2,
        is_enabled: true,
        settings: {},
        gallery: {
          gallery_id: 5,
          view_mode: 'grid',
        },
      },
      {
        id: 14,
        section_name: 'Quote Module',
        section_type: 'quote',
        sort_order: 3,
        is_enabled: true,
        settings: {},
        quote: {
          quote_content: 'Shared stories keep our gatherings close, even between seasons.',
          attribution: 'Community newsletter',
        },
      },
      {
        id: 15,
        section_name: 'CTA Banner',
        section_type: 'cta_banner',
        sort_order: 4,
        is_enabled: true,
        settings: {},
        cta_banner: {
          banner_heading: 'Online donation',
          banner_message: 'You can donate via our CanadaHelps platform.',
          button_text: 'Donate now',
          button_url: 'https://example.com/donate',
          open_in_new_tab: true,
        },
      },
    ],
  },
}

const sampleGallery = {
  id: 5,
  name: 'Community portraits',
  description: 'Portraits and exhibit images from the community archive.',
  published: true,
  asset_limit: 20,
  cover_image: null,
  images: [
    {
      id: 1,
      gallery_id: 5,
      title: 'Fran Fletcher-Luther',
      alt_text: 'Portrait of Fran Fletcher-Luther',
      file_name: 'fran.jpg',
      file_url: '/api/galleries/5/images/1/content',
      mime_type: 'image/jpeg',
      file_size: 0,
      sort_order: 0,
      created_at: '',
      updated_at: '',
    },
  ],
  created_at: '',
  updated_at: '',
}

const sampleChildPage = {
  ...sampleHomePage,
  id: 7,
  page_title: 'Contact Us',
  url_slug: '/home/contact-us',
  page_detail: {
    ...sampleHomePage.page_detail,
    id: 2,
    page_id: 7,
    sections: [
      {
        id: 21,
        section_name: 'Header Module',
        section_type: 'header',
        sort_order: 0,
        is_enabled: true,
        settings: {},
        header: {
          main_header_text: 'Contact Us',
          sub_header_text: 'Reach the CSAA team for support and community questions.',
          hierarchy: 'h1_hero',
        },
      },
    ],
  },
}

const sampleEmptyPage = {
  ...sampleHomePage,
  id: 9,
  page_title: 'Empty Page',
  url_slug: '/home/empty',
  seo_page_description: 'Placeholder copy for pages without CMS sections yet.',
  page_detail: {
    ...sampleHomePage.page_detail,
    id: 3,
    page_id: 9,
    sections: [],
  },
}

beforeEach(async () => {
  getMainMenu.mockReset()
  getPageBySlug.mockReset()
  getGallery.mockReset()
  listUpcomingEvents.mockReset()
  listArchivedEvents.mockReset()
  listEventsByDateRange.mockReset()
  getMainMenu.mockResolvedValue(sampleMenu)
  getPageBySlug.mockImplementation(async (slug: string) => {
    if (slug === '/home/contact-us') {
      return sampleChildPage
    }
    if (slug === '/home/empty') {
      return sampleEmptyPage
    }

    return sampleHomePage
  })
  getGallery.mockResolvedValue(sampleGallery)
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
  it('redirects to the first internal menu slug and renders the CMS page', async () => {
    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /welcome to the csaa newsletter/i,
      }),
    ).toBeDefined()
    expect(window.location.pathname).toBe('/home')
    expect(getPageBySlug).toHaveBeenCalledWith('/home')
    expect(await screen.findByRole('heading', { name: /community portraits/i })).toBeDefined()
    expect(getGallery).toHaveBeenCalledWith(5)
    expect(
      screen.getByText(
        /the newsletter shares community updates, stories, and upcoming opportunities\./i,
      ),
    ).toBeDefined()
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

    await screen.findByRole('heading', {
      name: /welcome to the csaa newsletter/i,
    })

    fireEvent.click(screen.getByRole('button', { name: 'FR' }))

    expect(
      await screen.findByText(
        /evenements, ressources culturelles et moments partages au meme endroit\./i,
      ),
    ).toBeDefined()
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
        name: /^contact us$/i,
      }),
    ).toBeDefined()
    expect(
      within(screen.getByRole('navigation')).getByRole('link', { name: /^home$/i })
        .getAttribute('aria-current'),
    ).toBe('page')
  })

  it('shows the placeholder hero when a CMS page has no content sections yet', async () => {
    window.history.pushState({}, '', '/home/empty')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /^empty page$/i,
      }),
    ).toBeDefined()
    expect(
      screen.getByText(/placeholder copy for pages without cms sections yet\./i),
    ).toBeDefined()
  })
})
