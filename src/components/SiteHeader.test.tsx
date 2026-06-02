import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MenuResponse } from '../api/menusApi'
import i18n from '../i18n'
import { SiteHeader } from './SiteHeader'

const { useNavigationMenuMock } = vi.hoisted(() => ({
  useNavigationMenuMock: vi.fn(),
}))

vi.mock('./NavigationMenuProvider', () => ({
  useNavigationMenu: useNavigationMenuMock,
}))

const sampleMenu: MenuResponse = {
  id: 1,
  menu_key: 'main',
  name: 'Main Website Navigation',
  items: [
    {
      id: 10,
      parent_id: null,
      label: 'Programs',
      navigation_type: 'pages',
      page_id: 10,
      external_url: '',
      open_in_new_tab: false,
      sort_order: 0,
      href: '/programs',
      page_type: 'page',
      page: {
        id: 10,
        page_title: 'Programs',
        url_slug: '/programs',
        parent_id: null,
        page_type: 'page',
        status: 'published',
      },
      children: [
        {
          id: 11,
          parent_id: 10,
          label: 'Healing Services',
          navigation_type: 'pages',
          page_id: 11,
          external_url: '',
          open_in_new_tab: false,
          sort_order: 0,
          href: '/programs/healing-services',
          page_type: 'page',
          page: {
            id: 11,
            page_title: 'Healing Services',
            url_slug: '/programs/healing-services',
            parent_id: 10,
            page_type: 'page',
            status: 'published',
          },
          children: [
            {
              id: 12,
              parent_id: 11,
              label: 'Crisis Support',
              navigation_type: 'pages',
              page_id: 12,
              external_url: '',
              open_in_new_tab: false,
              sort_order: 0,
              href: '/programs/healing-services/crisis-support',
              page_type: 'page',
              page: {
                id: 12,
                page_title: 'Crisis Support',
                url_slug: '/programs/healing-services/crisis-support',
                parent_id: 11,
                page_type: 'page',
                status: 'published',
              },
              children: [],
            },
          ],
        },
        {
          id: 13,
          parent_id: 10,
          label: 'Cultural Archive',
          navigation_type: 'pages',
          page_id: 13,
          external_url: '',
          open_in_new_tab: false,
          sort_order: 1,
          href: '/programs/cultural-archive',
          page_type: 'page',
          page: {
            id: 13,
            page_title: 'Cultural Archive',
            url_slug: '/programs/cultural-archive',
            parent_id: 10,
            page_type: 'page',
            status: 'published',
          },
          children: [],
        },
      ],
    },
    {
      id: 20,
      parent_id: null,
      label: 'Events',
      navigation_type: 'pages',
      page_id: 20,
      external_url: '',
      open_in_new_tab: false,
      sort_order: 1,
      href: '/events',
      page_type: 'module',
      page: {
        id: 20,
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

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
    </MemoryRouter>,
  )
}

describe('SiteHeader', () => {
  beforeEach(async () => {
    useNavigationMenuMock.mockReset()
    useNavigationMenuMock.mockReturnValue({
      menu: sampleMenu,
      isLoading: false,
      hasRemoteMenu: true,
    })

    window.localStorage.clear()
    await i18n.changeLanguage('en')
  })

  it('opens the desktop submenu on hover and reveals nested items in a right-side flyout', () => {
    renderHeader()

    const programsLink = screen.getByRole('link', { name: /^programs$/i })
    const programsGroup = programsLink.parentElement?.parentElement

    expect(programsLink.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: /healing services/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /crisis support/i })).toBeNull()

    if (!programsGroup) {
      throw new Error('Programs menu group was not rendered.')
    }

    fireEvent.mouseEnter(programsGroup)

    expect(programsLink.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: /healing services/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /cultural archive/i })).toBeDefined()
    expect(screen.queryByRole('link', { name: /crisis support/i })).toBeNull()

    const healingServicesLink = screen.getByRole('link', { name: /healing services/i })
    const healingServicesItem = healingServicesLink.parentElement

    if (!healingServicesItem) {
      throw new Error('Healing Services submenu item was not rendered.')
    }

    fireEvent.mouseEnter(healingServicesItem)

    expect(screen.getByRole('link', { name: /crisis support/i })).toBeDefined()

    fireEvent.mouseLeave(programsGroup)

    expect(programsLink.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: /crisis support/i })).toBeNull()
  })
})
