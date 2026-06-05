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
  getNewsletter,
  getPressEntry,
  getPageBySlug,
  listPublishedNewsletters,
  listPublishedPressEntries,
  listResources,
  listUpcomingEvents,
  listArchivedEvents,
  listEventsByDateRange,
} = vi.hoisted(() => ({
  getMainMenu: vi.fn(),
  getPageBySlug: vi.fn(),
  getGallery: vi.fn(),
  getNewsletter: vi.fn(),
  getPressEntry: vi.fn(),
  listPublishedNewsletters: vi.fn(),
  listPublishedPressEntries: vi.fn(),
  listResources: vi.fn(),
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

vi.mock('./api/newslettersApi', () => ({
  newslettersApi: {
    getNewsletter,
    listPublishedNewsletters,
  },
}))

vi.mock('./api/pressApi', () => ({
  pressApi: {
    getPressEntry,
    listPublishedPressEntries,
  },
}))

vi.mock('./api/resourcesApi', async () => {
  const actual = await vi.importActual<typeof import('./api/resourcesApi')>('./api/resourcesApi')

  return {
    ...actual,
    publicResourcesApi: {
      ...actual.publicResourcesApi,
      listResources,
    },
  }
})

vi.mock('./components/newsletters/NewsletterFlipbook', () => ({
  NewsletterFlipbook: ({ title }: { title: string }) => <div>Flipbook for {title}</div>,
}))

function renderWithProviders(ui: ReactElement) {
  const store = createAppStore()
  return render(<Provider store={store}>{ui}</Provider>)
}

async function findPrimaryNavigationLink(name: string | RegExp) {
  const navigation = await screen.findByRole('navigation', {
    name: /primary navigation/i,
  })

  return within(navigation).findByRole('link', { name })
}

async function findBreadcrumbNavigation() {
  return screen.findByRole('navigation', { name: /breadcrumb/i })
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
    {
      id: 22,
      parent_id: null,
      label: 'News & Media',
      navigation_type: 'pages',
      page_id: 9,
      external_url: '',
      open_in_new_tab: false,
      sort_order: 2,
      href: '/news-media/digital-newsletter',
      page_type: 'module',
      page: {
        id: 9,
        page_title: 'News & Media',
        url_slug: '/news-media/digital-newsletter',
        parent_id: null,
        page_type: 'module',
        status: 'published',
      },
      children: [
        {
          id: 23,
          parent_id: 22,
          label: 'Digital Newsletters',
          navigation_type: 'pages',
          page_id: 10,
          external_url: '',
          open_in_new_tab: false,
          sort_order: 0,
          href: '/news-media/digital-newsletter',
          page_type: 'module',
          page: {
            id: 10,
            page_title: 'Digital Newsletters',
            url_slug: '/news-media/digital-newsletter',
            parent_id: 9,
            page_type: 'module',
            status: 'published',
          },
          children: [],
        },
        {
          id: 24,
          parent_id: 22,
          label: 'Press Archive',
          navigation_type: 'pages',
          page_id: 11,
          external_url: '',
          open_in_new_tab: false,
          sort_order: 1,
          href: '/news-media/press-archive',
          page_type: 'module',
          page: {
            id: 11,
            page_title: 'Press Archive',
            url_slug: '/news-media/press-archive',
            parent_id: 9,
            page_type: 'module',
            status: 'published',
          },
          children: [],
        },
      ],
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
          sub_header_text: 'Community updates',
          description: 'Stories, updates, and shared moments from the community.',
          hierarchy: 'h1_hero',
          text_align: 'left',
          underline_enabled: false,
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
        section_name: 'Document Module',
        section_type: 'document',
        sort_order: 4,
        is_enabled: true,
        settings: {},
        documents: {
          items: [
            {
              id: 21,
              display_name: 'Board agenda',
              description: 'Download the latest meeting agenda.',
              original_file_name: 'agenda.pdf',
              file_name: 'agenda.pdf',
              file_url: '',
              fetch_url: '/api/pages/documents/21/content',
              storage_uri: '',
              gcp_object_key: '',
              mime_type: 'application/pdf',
              file_size: 1024,
              sort_order: 0,
              created_at: '',
              updated_at: '',
            },
          ],
        },
      },
      {
        id: 16,
        section_name: 'CTA Banner',
        section_type: 'cta_banner',
        sort_order: 5,
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
          sub_header_text: 'Community support',
          description: 'Reach the CSAA team for support and community questions.',
          hierarchy: 'h1_hero',
          text_align: 'left',
          underline_enabled: false,
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

const samplePageWithoutHeader = {
  ...sampleHomePage,
  id: 26,
  page_title: 'Reclaiming Shingwauk Hall Exhibition',
  url_slug: '/our-story/healing-memorials/reclaiming-shingwauk-hall-exhibition',
  parent_id: 23,
  parent_page_title: 'Healing & Memorials',
  parent_page_url_slug: '/our-story/healing-memorials',
  hero_image_enabled: true,
  hero_image_url: 'gs://nordik-csa-documents/pages/26/hero_shingwaukhall-hero.jpg',
  hero_image_object_key: 'pages/26/hero_shingwaukhall-hero.jpg',
  hero_image_fetch_url: '/api/pages/26/hero/content',
  seo_page_title: 'Shingwauk Hall Residential School Exhibition - CSAA',
  seo_page_description:
    'Explore the history, stories, and legacy of the Shingwauk Indian Residential School.',
  page_detail: {
    ...sampleHomePage.page_detail,
    id: 13,
    page_id: 26,
    sections: [
      {
        id: 275,
        section_name: 'Typography',
        section_type: 'typography',
        sort_order: 0,
        is_enabled: true,
        settings: {},
        typography: {
          html_content:
            '<p>Reclaiming Shingwauk Hall is the first major, permanent Residential School Survivor driven exhibition in a former Residential School building.</p>',
          text_content:
            'Reclaiming Shingwauk Hall is the first major, permanent Residential School Survivor driven exhibition in a former Residential School building.',
          text_align: 'left',
        },
      },
      {
        id: 276,
        section_name: 'Gallery Module',
        section_type: 'gallery',
        sort_order: 1,
        is_enabled: true,
        settings: {},
        gallery: {
          gallery_id: 5,
          view_mode: 'masonry',
        },
      },
    ],
  },
}

const samplePageWithSectionHeaderAndHero = {
  ...sampleHomePage,
  id: 36,
  page_title: 'CSAA Members',
  url_slug: '/community-support-team/csaa-members',
  parent_id: 29,
  parent_page_title: 'Community Support Team',
  parent_page_url_slug: '/community-support-team',
  hero_image_enabled: true,
  hero_image_url: 'gs://nordik-csa-documents/pages/36/hero_20260526191645_makwa17.jpg',
  hero_image_object_key: 'pages/36/hero_20260526191645_makwa17.jpg',
  hero_image_fetch_url: '/api/pages/36/hero/content',
  seo_page_title: 'CSAA Members | Children of Shingwauk Alumni Association',
  seo_page_description:
    'Welcome to the CSAA members network. Find resources, community support tools, and updates for residential school survivors and alumni.',
  page_detail: {
    ...sampleHomePage.page_detail,
    id: 17,
    page_id: 36,
    sections: [
      {
        id: 453,
        section_name: 'Header Module',
        section_type: 'header',
        sort_order: 0,
        is_enabled: true,
        settings: {},
        header: {
          main_header_text: 'Meet The CSAA !',
          sub_header_text: 'Community support team',
          description: 'Resources, updates, and community care built for CSAA members.',
          hierarchy: 'h2_section',
          text_align: 'left',
          underline_enabled: true,
        },
      },
      {
        id: 454,
        section_name: 'Typography',
        section_type: 'typography',
        sort_order: 1,
        is_enabled: true,
        settings: {},
        typography: {
          html_content:
            '<p>Welcome to the official Children of Shingwauk Alumni Association Members portal. This dedicated space is designed to help our community stay connected, collaborate on ongoing healing and memorial initiatives, and easily access network resources.</p>',
          text_content:
            'Welcome to the official Children of Shingwauk Alumni Association Members portal. This dedicated space is designed to help our community stay connected, collaborate on ongoing healing and memorial initiatives, and easily access network resources.',
          text_align: 'center',
        },
      },
    ],
  },
}

const samplePageWithLateHeroHeader = {
  ...sampleHomePage,
  id: 44,
  page_title: 'Pathways to Healing',
  url_slug: '/community-support-team/pathways-to-healing',
  parent_id: 29,
  parent_page_title: 'Community Support Team',
  parent_page_url_slug: '/community-support-team',
  hero_image_enabled: true,
  hero_image_url: 'gs://nordik-csa-documents/pages/44/hero_pathways.jpg',
  hero_image_object_key: 'pages/44/hero_pathways.jpg',
  hero_image_fetch_url: '/api/pages/44/hero/content',
  seo_page_title: 'Pathways to Healing | Children of Shingwauk Alumni Association',
  seo_page_description: 'Stories, services, and survivor-led healing pathways across the CSAA community.',
  page_detail: {
    ...sampleHomePage.page_detail,
    id: 19,
    page_id: 44,
    sections: [
      {
        id: 601,
        section_name: 'Typography',
        section_type: 'typography',
        sort_order: 0,
        is_enabled: true,
        settings: {},
        typography: {
          html_content:
            '<p>This paragraph was created before the hero header, but the hero still needs to appear first.</p>',
          text_content:
            'This paragraph was created before the hero header, but the hero still needs to appear first.',
          text_align: 'left',
        },
      },
      {
        id: 602,
        section_name: 'Header Module',
        section_type: 'header',
        sort_order: 1,
        is_enabled: true,
        settings: {},
        header: {
          main_header_text: 'Pathways to Healing',
          sub_header_text: 'Community support team',
          description:
            'Stories, services, and survivor-led healing pathways across the CSAA community.',
          hierarchy: 'h1_hero',
          text_align: 'left',
          underline_enabled: false,
        },
      },
    ],
  },
}

const sampleNewsletters = [
  {
    id: 11,
    title: 'Community Reunion Highlights',
    category: 'csaa',
    send_date: '2026-05-01T00:00:00Z',
    content_html: '<p>Revisiting reunion stories from across the community.</p>',
    status: 'published',
    visibility: 'public',
    publish_at: null,
    created_at: '',
    updated_at: '',
    media: [
      {
        id: 201,
        display_name: 'Display image',
        file_name: 'reunion.jpg',
        gcp_object_key: '',
        file_url: '/api/newsletters/11/media/201/content',
        mime_type: 'image/jpeg',
        file_size: 1024,
        media_role: 'attachment',
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
      {
        id: 202,
        display_name: 'Edition PDF',
        file_name: 'reunion.pdf',
        gcp_object_key: '',
        file_url: '/api/newsletters/11/media/202/content',
        mime_type: 'application/pdf',
        file_size: 2048,
        media_role: 'attachment',
        sort_order: 1,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: 12,
    title: 'Archival Digitization Milestones',
    category: 'cst',
    send_date: '2025-11-15T00:00:00Z',
    content_html: '<p>Digitization updates and collection notes.</p>',
    status: 'published',
    visibility: 'public',
    publish_at: null,
    created_at: '',
    updated_at: '',
    media: [
      {
        id: 301,
        display_name: 'Edition PDF',
        file_name: 'digitization.pdf',
        gcp_object_key: '',
        file_url: '/api/newsletters/12/media/301/content',
        mime_type: 'application/pdf',
        file_size: 2048,
        media_role: 'attachment',
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
    ],
  },
]

const samplePressEntries = [
  {
    id: 71,
    title: 'Press coverage spotlight',
    release_date: '2026-04-20T00:00:00Z',
    category_id: null,
    source_url: 'https://example.com/coverage',
    content_html: '<p>Press coverage and interviews from across the community.</p>',
    status: 'published',
    visibility: 'public',
    cover_image_url: '/api/press/71/cover/content',
    cover_image_gcp_key: '',
    publish_at: null,
    media: [
      {
        id: 801,
        display_name: 'Press PDF',
        file_name: 'coverage.pdf',
        gcp_object_key: '',
        file_url: '/api/press/71/media/801/content',
        mime_type: 'application/pdf',
        file_size: 1024,
        media_role: 'attachment',
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
    ],
    created_at: '',
    updated_at: '',
  },
  {
    id: 72,
    title: 'Archived statement',
    release_date: '2025-08-14T00:00:00Z',
    category_id: null,
    source_url: '',
    content_html: '<p>Archived statement with supporting press files.</p>',
    status: 'published',
    visibility: 'public',
    cover_image_url: '',
    cover_image_gcp_key: '',
    publish_at: null,
    media: [
      {
        id: 802,
        display_name: 'Archive PDF',
        file_name: 'statement.pdf',
        gcp_object_key: '',
        file_url: '/api/press/72/media/802/content',
        mime_type: 'application/pdf',
        file_size: 1024,
        media_role: 'attachment',
        sort_order: 0,
        created_at: '',
        updated_at: '',
      },
    ],
    created_at: '',
    updated_at: '',
  },
]

beforeEach(async () => {
  getMainMenu.mockReset()
  getPageBySlug.mockReset()
  getGallery.mockReset()
  getNewsletter.mockReset()
  getPressEntry.mockReset()
  listPublishedNewsletters.mockReset()
  listPublishedPressEntries.mockReset()
  listResources.mockReset()
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
    if (slug === '/community-support-team/csaa-members') {
      return samplePageWithSectionHeaderAndHero
    }
    if (slug === '/community-support-team/pathways-to-healing') {
      return samplePageWithLateHeroHeader
    }
    if (slug === '/our-story/healing-memorials/reclaiming-shingwauk-hall-exhibition') {
      return samplePageWithoutHeader
    }

    return sampleHomePage
  })
  getGallery.mockResolvedValue(sampleGallery)
  listPublishedNewsletters.mockResolvedValue(sampleNewsletters)
  getNewsletter.mockImplementation(async (id: number) => {
    const match = sampleNewsletters.find((entry) => entry.id === id)
    if (!match) {
      throw new Error('not found')
    }

    return match
  })
  listPublishedPressEntries.mockResolvedValue(samplePressEntries)
  listResources.mockResolvedValue({
    items: [
      {
        id: '7',
        name: 'Community guide',
        description: 'Helpful support information.',
        category: 'report',
        categoryLabel: 'Report',
        visibility: 'public',
        linkUrl: '',
        fileName: 'guide.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 1024,
        hasDocument: true,
        contentUrl: '',
        createdAt: '',
        updatedAt: '',
      },
    ],
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  })
  getPressEntry.mockImplementation(async (id: number) => {
    const match = samplePressEntries.find((entry) => entry.id === id)
    if (!match) {
      throw new Error('not found')
    }

    return match
  })
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
    expect(
      await screen.findByRole('button', { name: /fran fletcher-luther/i }),
    ).toBeDefined()
    expect(getGallery).toHaveBeenCalledWith(5)
    expect(
      screen.getByText(
        /the newsletter shares community updates, stories, and upcoming opportunities\./i,
      ),
    ).toBeDefined()
    expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).toBeNull()
    expect(screen.getByText(/board agenda/i)).toBeDefined()
    expect((await findPrimaryNavigationLink(/^home$/i)).getAttribute('aria-current')).toBe(
      'page',
    )
    expect(await findPrimaryNavigationLink(/^events$/i)).toBeDefined()
    expect(screen.getAllByRole('button', { name: 'FR' })[0]).toBeDefined()
  })

  it('switches the shared coming soon copy to french', async () => {
    renderWithProviders(<App />)

    await screen.findByRole('heading', {
      name: /welcome to the csaa newsletter/i,
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'FR' })[0])

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
    const breadcrumb = await findBreadcrumbNavigation()
    expect(within(breadcrumb).getByRole('link', { name: /^home$/i }).getAttribute('href')).toBe(
      '/home',
    )
    expect(within(breadcrumb).getByRole('link', { name: /^events$/i }).getAttribute('href')).toBe(
      '/events',
    )
    expect(within(breadcrumb).getByText(/community calendar/i)).toBeDefined()
    expect((await findPrimaryNavigationLink(/^events$/i)).getAttribute('aria-current')).toBe(
      'page',
    )
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
    const breadcrumb = await findBreadcrumbNavigation()
    expect(within(breadcrumb).getByRole('link', { name: /^home$/i }).getAttribute('href')).toBe(
      '/home',
    )
    expect(within(breadcrumb).getByText(/^contact us$/i)).toBeDefined()
    expect((await findPrimaryNavigationLink(/^home$/i)).getAttribute('aria-current')).toBe(
      'page',
    )
  })

  it('shows the placeholder hero when a CMS page has no content sections yet', async () => {
    window.history.pushState({}, '', '/home/empty')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /^empty page$/i,
      }),
    ).toBeDefined()
    expect(screen.queryByText(/placeholder copy for pages without cms sections yet\./i)).toBeNull()
  })

  it('shows the page hero when a CMS page has content sections but no header section', async () => {
    window.history.pushState(
      {},
      '',
      '/our-story/healing-memorials/reclaiming-shingwauk-hall-exhibition',
    )

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /reclaiming shingwauk hall exhibition/i,
      }),
    ).toBeDefined()
    expect(
      screen.getByTestId('cms-fallback-hero-background').getAttribute('src'),
    ).toContain('/api/pages/26/hero/content')
    expect(
      within(screen.getByTestId('cms-fallback-hero')).queryByText(
        /explore the history, stories, and legacy of the shingwauk indian residential school\./i,
      ),
    ).toBeNull()
    expect(
      screen.getByText(/first major, permanent residential school survivor driven exhibition/i),
    ).toBeDefined()
  })

  it('shows the page hero when a CMS page has a non-hero header section and hero display is enabled', async () => {
    window.history.pushState({}, '', '/community-support-team/csaa-members')

    renderWithProviders(<App />)

    expect(
      await screen.findByTestId('cms-fallback-hero-background'),
    ).toBeDefined()
    expect(screen.getByTestId('cms-fallback-hero-background').getAttribute('src')).toContain(
      '/api/pages/36/hero/content',
    )
    expect(
      within(screen.getByTestId('cms-fallback-hero')).getByRole('heading', {
        name: /csaa members/i,
      }),
    ).toBeDefined()
    expect(
      within(screen.getByTestId('cms-fallback-hero')).queryByText(
        /welcome to the csaa members network\. find resources, community support tools, and updates for residential school survivors and alumni\./i,
      ),
    ).toBeNull()
    expect(
      within(screen.getByTestId('cms-fallback-hero')).getByText(/^community support team$/i),
    ).toBeDefined()
    expect(
      within(screen.getByTestId('cms-fallback-hero')).getByText(
        /resources, updates, and community care built for csaa members\./i,
      ),
    ).toBeDefined()
    expect(
      screen.getByRole('heading', {
        name: /meet the csaa/i,
      }),
    ).toBeDefined()
    expect(
      screen.getAllByText(/resources, updates, and community care built for csaa members\./i),
    ).toHaveLength(2)
    expect(
      screen.getByText(/welcome to the official children of shingwauk alumni association members portal/i),
    ).toBeDefined()
  })

  it('promotes an h1 header into the hero area even when it was created after other sections', async () => {
    window.history.pushState({}, '', '/community-support-team/pathways-to-healing')

    renderWithProviders(<App />)

    const heroHeading = await screen.findByRole('heading', {
      name: /pathways to healing/i,
    })
    const bodyText = screen.getByText(
      /this paragraph was created before the hero header, but the hero still needs to appear first\./i,
    )

    expect(screen.getByTestId('cms-header-hero-background').getAttribute('src')).toContain(
      '/api/pages/44/hero/content',
    )
    expect(heroHeading.compareDocumentPosition(bodyText) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders the news media landing route with stable seo metadata', async () => {
    window.history.pushState({}, '', '/news-media')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /news & media/i,
      }),
    ).toBeDefined()
    expect(
      (await findPrimaryNavigationLink(/news & media/i)).getAttribute('aria-current'),
    ).toBe('page')
    expect(document.title).toBe('News & Media | Children of Shingwauk Alumni Association')
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(
      'Read CSAA newsletters, browse press coverage, and find media contact details from the Children of Shingwauk Alumni Association.',
    )
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe(`${window.location.origin}/news-media`)

    const inquiriesImage = screen.getByRole('img', {
      name: /press and media equipment including cameras and a typewriter/i,
    })
    expect(inquiriesImage.getAttribute('loading')).toBe('lazy')
    expect(inquiriesImage.getAttribute('fetchpriority')).toBe('low')
    expect(inquiriesImage.getAttribute('width')).toBe('1200')
    expect(inquiriesImage.getAttribute('height')).toBe('900')
  })

  it('renders the digital newsletters module route with the shared header shell', async () => {
    window.history.pushState({}, '', '/news-media/digital-newsletter')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /digital newsletters/i,
      }),
    ).toBeDefined()
    expect(listPublishedNewsletters).toHaveBeenCalled()
    expect(getNewsletter).not.toHaveBeenCalled()
    expect(
      (await findPrimaryNavigationLink(/news & media/i)).getAttribute('aria-current'),
    ).toBe('page')
  })

  it('renders the newsletter detail route and keeps the news menu item active', async () => {
    window.history.pushState({}, '', '/news-media/digital-newsletter/11')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /community reunion highlights/i,
      }),
    ).toBeDefined()
    const breadcrumb = await findBreadcrumbNavigation()
    expect(
      within(breadcrumb).getByRole('link', { name: /news & media/i }).getAttribute('href'),
    ).toBe('/news-media')
    expect(
      within(breadcrumb).getByRole('link', { name: /digital newsletters/i }).getAttribute('href'),
    ).toBe('/news-media/digital-newsletter')
    expect(within(breadcrumb).getByText(/community reunion highlights/i)).toBeDefined()
    expect(screen.getByText(/flipbook for community reunion highlights/i)).toBeDefined()
    expect(getNewsletter).toHaveBeenCalledWith(11)
    expect(
      (await findPrimaryNavigationLink(/news & media/i)).getAttribute('aria-current'),
    ).toBe('page')
  })

  it('renders the shared breadcrumb for the community resources route', async () => {
    window.history.pushState({}, '', '/community-support-team/resources')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /resources & support/i,
      }),
    ).toBeDefined()
    const breadcrumb = await findBreadcrumbNavigation()
    expect(within(breadcrumb).getByRole('link', { name: /^home$/i }).getAttribute('href')).toBe(
      '/home',
    )
    expect(
      within(breadcrumb)
        .getByRole('link', { name: /community support team/i })
        .getAttribute('href'),
    ).toBe('/community-support-team')
    expect(within(breadcrumb).getByText(/resources & support/i)).toBeDefined()
  })

  it('renders the press archive module route and keeps the news menu item active', async () => {
    window.history.pushState({}, '', '/news-media/press-archive')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /press archive/i,
      }),
    ).toBeDefined()
    expect(listPublishedPressEntries).toHaveBeenCalled()
    expect(getPressEntry).not.toHaveBeenCalled()
    expect(
      (await findPrimaryNavigationLink(/news & media/i)).getAttribute('aria-current'),
    ).toBe('page')
  })

  it('renders the press archive detail route and keeps the news menu item active', async () => {
    window.history.pushState({}, '', '/news-media/press-archive/72')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /archived statement/i,
      }),
    ).toBeDefined()
    expect(getPressEntry).toHaveBeenCalledWith(72)
    expect(
      (await findPrimaryNavigationLink(/news & media/i)).getAttribute('aria-current'),
    ).toBe('page')
  })
})
