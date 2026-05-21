import type { MenuItem, MenuResponse } from '../api/menusApi'

export const fallbackMainMenu: MenuResponse = {
  id: 0,
  menu_key: 'main',
  name: 'Fallback Website Navigation',
  items: [
    {
      id: 1,
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
      children: [],
    },
    {
      id: 2,
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

export function sortMenuItems(items: MenuItem[]): MenuItem[] {
  return [...items]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((item) => ({
      ...item,
      children: sortMenuItems(item.children ?? []),
    }))
}

export function getMenuItemHref(item: MenuItem) {
  if (isExternalMenuItem(item)) {
    return item.external_url.trim() || item.href.trim()
  }

  return item.page?.url_slug?.trim() || item.href.trim() || '/'
}

export function isExternalMenuItem(item: MenuItem) {
  return item.navigation_type === 'external_link'
}

export function isModuleMenuItem(item: MenuItem) {
  return item.page_type === 'module' || item.page?.page_type === 'module'
}

export function hasMenuChildren(item: MenuItem) {
  return Boolean(item.children?.length)
}

export function normalizeInternalPath(path: string) {
  if (!path.trim()) {
    return '/'
  }

  const trimmedPath = path.trim()

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const url = new URL(trimmedPath)
      return normalizeInternalPath(url.pathname)
    } catch {
      return '/'
    }
  }

  const [pathname] = trimmedPath.split(/[?#]/)
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  const normalizedPath = withLeadingSlash.replace(/\/+$/, '')

  return normalizedPath || '/'
}

export function matchesMenuPath(pathname: string, href: string) {
  const normalizedPathname = normalizeInternalPath(pathname)
  const normalizedHref = normalizeInternalPath(href)

  if (normalizedHref === '/') {
    return normalizedPathname === '/'
  }

  return (
    normalizedPathname === normalizedHref ||
    normalizedPathname.startsWith(`${normalizedHref}/`)
  )
}

export function isMenuItemActive(item: MenuItem, pathname: string): boolean {
  if (!isExternalMenuItem(item)) {
    const href = getMenuItemHref(item)

    if (matchesMenuPath(pathname, href)) {
      return true
    }

    if (isModuleMenuItem(item) && matchesModuleSectionPath(pathname, href)) {
      return true
    }
  }

  return item.children.some((child) => isMenuItemActive(child, pathname))
}

function matchesModuleSectionPath(pathname: string, href: string) {
  const pathnameSegments = normalizeInternalPath(pathname).split('/').filter(Boolean)
  const hrefSegments = normalizeInternalPath(href).split('/').filter(Boolean)

  if (!pathnameSegments.length || !hrefSegments.length) {
    return false
  }

  return pathnameSegments[0] === hrefSegments[0]
}

export function findMenuItemByPath(
  items: MenuItem[],
  pathname: string,
): MenuItem | null {
  let bestMatch: MenuItem | null = null

  const visit = (item: MenuItem) => {
    if (!isExternalMenuItem(item) && matchesMenuPath(pathname, getMenuItemHref(item))) {
      if (
        !bestMatch ||
        normalizeInternalPath(getMenuItemHref(item)).length >
          normalizeInternalPath(getMenuItemHref(bestMatch)).length
      ) {
        bestMatch = item
      }
    }

    item.children.forEach(visit)
  }

  sortMenuItems(items).forEach(visit)
  return bestMatch
}

export function getInitialMenuHref(items: MenuItem[]): string {
  const firstInternalItem = sortMenuItems(items).find((item) => !isExternalMenuItem(item))
  return firstInternalItem ? normalizeInternalPath(getMenuItemHref(firstInternalItem)) : '/events'
}

export function formatPathLabel(pathname: string) {
  const normalizedPath = normalizeInternalPath(pathname)
  const segments = normalizedPath.split('/').filter(Boolean)

  if (!segments.length) {
    return 'Home'
  }

  return segments[segments.length - 1]
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}
