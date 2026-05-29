import type { MenuItem } from '../api/menusApi'
import {
  findMenuTrailByPath,
  formatPathLabel,
  getInitialMenuHref,
  getMenuItemHref,
  isExternalMenuItem,
  normalizeInternalPath,
  sortMenuItems,
} from './navigationMenu'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export function normalizeBreadcrumbItems(items: BreadcrumbItem[]) {
  return items.reduce<BreadcrumbItem[]>((normalized, item) => {
    const label = item.label.trim()
    const href = item.href ? normalizeInternalPath(item.href) : undefined

    if (!label) {
      return normalized
    }

    const previousItem = normalized[normalized.length - 1]
    if (
      previousItem &&
      previousItem.label === label &&
      previousItem.href === href
    ) {
      return normalized
    }

    normalized.push({
      label,
      href,
    })

    return normalized
  }, [])
}

export function getHomeBreadcrumbItem(
  items: MenuItem[],
  fallbackLabel: string,
): BreadcrumbItem {
  const homeItem = findHomeMenuItem(items)

  if (homeItem) {
    return {
      label: homeItem.label.trim() || fallbackLabel,
      href: normalizeInternalPath(getMenuItemHref(homeItem)),
    }
  }

  return {
    label: fallbackLabel,
    href: normalizeInternalPath(getInitialMenuHref(items)),
  }
}

export function buildDefaultBreadcrumbItems(
  pathname: string,
  menuItems: MenuItem[],
  homeItem: BreadcrumbItem,
) {
  const normalizedPath = normalizeInternalPath(pathname)
  const normalizedHomeHref = normalizeInternalPath(homeItem.href ?? '/')

  if (normalizedPath === '/' || normalizedPath === normalizedHomeHref) {
    return []
  }

  const menuTrail = findMenuTrailByPath(menuItems, normalizedPath)
  if (menuTrail.length) {
    return normalizeBreadcrumbItems(
      menuTrail
        .map((item) => ({
          label: item.label,
          href: getMenuItemHref(item),
        }))
        .filter((item, index) => {
          if (index !== 0) {
            return true
          }

          return (
            normalizeInternalPath(item.href ?? '/') !== normalizedHomeHref &&
            item.label.trim() !== homeItem.label.trim()
          )
        }),
    )
  }

  return buildPathBreadcrumbItems(normalizedPath, normalizedHomeHref)
}

export function buildPathBreadcrumbItems(pathname: string, homeHref: string) {
  const normalizedPath = normalizeInternalPath(pathname)
  const pathSegments = normalizedPath.split('/').filter(Boolean)
  const homeSegments = normalizeInternalPath(homeHref).split('/').filter(Boolean)
  const homePrefixLength =
    homeSegments.length &&
    homeSegments.every((segment, index) => pathSegments[index] === segment)
      ? homeSegments.length
      : 0

  return pathSegments.slice(homePrefixLength).map((segment, index) => {
    const absoluteSegments = pathSegments.slice(0, homePrefixLength + index + 1)

    return {
      label: formatPathLabel(segment),
      href: `/${absoluteSegments.join('/')}`,
    }
  })
}

function findHomeMenuItem(items: MenuItem[]): MenuItem | null {
  for (const item of sortMenuItems(items)) {
    if (isExternalMenuItem(item)) {
      continue
    }

    const href = normalizeInternalPath(getMenuItemHref(item))
    const label = item.label.trim().toLowerCase()

    if (href === '/' || href === '/home' || label === 'home') {
      return item
    }

    const matchingChild = findHomeMenuItem(item.children ?? [])
    if (matchingChild) {
      return matchingChild
    }
  }

  return null
}
