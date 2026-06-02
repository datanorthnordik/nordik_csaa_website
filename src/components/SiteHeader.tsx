import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MenuItem } from '../api/menusApi'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import {
  getInitialMenuHref,
  getMenuItemHref,
  hasMenuChildren,
  isExternalMenuItem,
  isMenuItemActive,
} from '../lib/navigationMenu'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useNavigationMenu } from './NavigationMenuProvider'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { menu, isLoading } = useNavigationMenu()
  const headerRef = useRef<HTMLElement | null>(null)
  const [openDesktopMenuId, setOpenDesktopMenuId] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMobileItemIds, setExpandedMobileItemIds] = useState<number[]>([])

  useEffect(() => {
    setOpenDesktopMenuId(null)
    setIsMobileMenuOpen(false)
    setExpandedMobileItemIds([])
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      setOpenDesktopMenuId(null)
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current?.contains(event.target as Node)) {
        return
      }

      setOpenDesktopMenuId(null)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  function openDesktopMenu(itemId: number) {
    setOpenDesktopMenuId(itemId)
  }

  function closeDesktopMenu() {
    setOpenDesktopMenuId(null)
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((current) => !current)
  }

  function toggleMobileItem(itemId: number) {
    setExpandedMobileItemIds((current) =>
      current.includes(itemId)
        ? current.filter((value) => value !== itemId)
        : [...current, itemId],
    )
  }

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.headerInner}>
        <Link
          to={getInitialMenuHref(menu.items)}
          className={styles.brand}
          aria-label={t('site.header.title')}
        >
          <img src={WEBSITE_ASSET_URLS.csaaLogo} alt="" className={styles.brandLogo} />
        </Link>

        <nav className={styles.nav} aria-label={t('site.nav.ariaLabel')}>
          {isLoading ? (
            <div className={styles.loadingNav} aria-hidden="true">
              <span className={styles.loadingPill} />
              <span className={styles.loadingPill} />
              <span className={styles.loadingPill} />
              <span className={styles.loadingPill} />
            </div>
          ) : (
            menu.items.map((item) => (
              <DesktopNavigationItem
                key={item.id}
                item={item}
                pathname={pathname}
                isOpen={openDesktopMenuId === item.id}
                onOpen={() => openDesktopMenu(item.id)}
                onClose={closeDesktopMenu}
              />
            ))
          )}
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.languageDesktop}>
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-expanded={isMobileMenuOpen}
            aria-label={
              isMobileMenuOpen ? t('site.nav.closeMenu') : t('site.nav.openMenu')
            }
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <>
          <button
            type="button"
            className={styles.mobileBackdrop}
            aria-label={t('site.nav.closeMenu')}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={styles.mobilePanel}>
            <div className={styles.mobilePanelHeader}>
              <p>{t('site.nav.directory')}</p>
              <LanguageSwitcher />
            </div>

            <MobileNavigationList
              items={menu.items}
              pathname={pathname}
              expandedItemIds={expandedMobileItemIds}
              onToggle={toggleMobileItem}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </>
      ) : null}
    </header>
  )
}

function DesktopNavigationItem({
  item,
  pathname,
  isOpen,
  onOpen,
  onClose,
}: {
  item: MenuItem
  pathname: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const active = isMenuItemActive(item, pathname)
  const itemHasChildren = hasMenuChildren(item)

  return (
    <div
      className={styles.navItemGroup}
      onMouseEnter={itemHasChildren ? onOpen : undefined}
      onMouseLeave={itemHasChildren ? onClose : undefined}
      onFocus={itemHasChildren ? onOpen : undefined}
      onBlur={
        itemHasChildren
          ? (event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                return
              }

              onClose()
            }
          : undefined
      }
    >
      <div className={styles.navItemShell}>
        <MenuItemLink
          item={item}
          className={`${styles.navLink} ${active ? styles.navLinkActive : ''} ${
            isOpen ? styles.navLinkOpen : ''
          }`}
          ariaCurrent={active ? 'page' : undefined}
          ariaExpanded={itemHasChildren ? isOpen : undefined}
          ariaHaspopup={itemHasChildren ? 'menu' : undefined}
          onNavigate={onClose}
        />
        {itemHasChildren ? (
          <span className={`${styles.navChevron} ${isOpen ? styles.navChevronOpen : ''}`} aria-hidden="true">
            <ChevronIcon />
          </span>
        ) : null}
      </div>

      {itemHasChildren && isOpen ? (
        <div className={styles.dropdownPanel}>
          <DesktopSubmenuList items={item.children} pathname={pathname} onNavigate={onClose} />
        </div>
      ) : null}
    </div>
  )
}

function DesktopSubmenuList({
  items,
  pathname,
  onNavigate,
}: {
  items: MenuItem[]
  pathname: string
  onNavigate: () => void
}) {
  return (
    <ul className={styles.dropdownList}>
      {items.map((item) => (
        <DesktopSubmenuItem
          key={item.id}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  )
}

function DesktopSubmenuItem({
  item,
  pathname,
  onNavigate,
}: {
  item: MenuItem
  pathname: string
  onNavigate: () => void
}) {
  const active = isMenuItemActive(item, pathname)
  const itemHasChildren = hasMenuChildren(item)
  const [isNestedOpen, setIsNestedOpen] = useState(false)
  const showNested = itemHasChildren && (isNestedOpen || active)

  return (
    <li
      className={styles.dropdownItem}
      onMouseEnter={itemHasChildren ? () => setIsNestedOpen(true) : undefined}
      onMouseLeave={itemHasChildren ? () => setIsNestedOpen(false) : undefined}
      onFocus={itemHasChildren ? () => setIsNestedOpen(true) : undefined}
      onBlur={
        itemHasChildren
          ? (event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                return
              }

              setIsNestedOpen(false)
            }
          : undefined
      }
    >
      <MenuItemLink
        item={item}
        className={`${styles.dropdownLink} ${
          itemHasChildren ? styles.dropdownLinkParent : ''
        } ${active ? styles.dropdownLinkActive : ''}`}
        ariaCurrent={active ? 'page' : undefined}
        onNavigate={onNavigate}
      >
        <span>{item.label}</span>
        {itemHasChildren ? <ChevronIcon className={styles.dropdownChevron} /> : null}
      </MenuItemLink>

      {showNested ? (
        <div className={styles.dropdownNested}>
          <DesktopSubmenuList items={item.children} pathname={pathname} onNavigate={onNavigate} />
        </div>
      ) : null}
    </li>
  )
}

function MobileNavigationList({
  items,
  pathname,
  expandedItemIds,
  onToggle,
  onNavigate,
  depth = 0,
}: {
  items: MenuItem[]
  pathname: string
  expandedItemIds: number[]
  onToggle: (itemId: number) => void
  onNavigate: () => void
  depth?: number
}) {
  const { t } = useTranslation()

  return (
    <ul className={styles.mobileList}>
      {items.map((item) => {
        const itemHasChildren = hasMenuChildren(item)
        const active = isMenuItemActive(item, pathname)
        const isExpanded = expandedItemIds.includes(item.id)

        return (
          <li key={item.id} className={styles.mobileItem}>
            <div
              className={`${styles.mobileRow} ${active ? styles.mobileRowActive : ''}`}
              style={{ paddingLeft: `${18 + depth * 16}px` }}
            >
              <MenuItemLink
                item={item}
                className={styles.mobileLink}
                ariaCurrent={active ? 'page' : undefined}
                onNavigate={onNavigate}
              />
              {itemHasChildren ? (
                <button
                  type="button"
                  className={styles.mobileExpandButton}
                  aria-expanded={isExpanded}
                  aria-label={t('site.nav.toggleSubmenu', { label: item.label })}
                  onClick={() => onToggle(item.id)}
                >
                  <ChevronIcon className={isExpanded ? styles.chevronOpen : ''} />
                </button>
              ) : null}
            </div>

            {itemHasChildren && isExpanded ? (
              <MobileNavigationList
                items={item.children}
                pathname={pathname}
                expandedItemIds={expandedItemIds}
                onToggle={onToggle}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function MenuItemLink({
  item,
  className,
  ariaCurrent,
  children,
  style,
  onNavigate,
  ariaExpanded,
  ariaHaspopup,
}: {
  item: MenuItem
  className: string
  ariaCurrent?: 'page'
  children?: ReactNode
  style?: CSSProperties
  onNavigate?: () => void
  ariaExpanded?: boolean
  ariaHaspopup?: 'menu'
}) {
  const content = children ?? item.label
  const href = getMenuItemHref(item)

  if (isExternalMenuItem(item)) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        target={item.open_in_new_tab ? '_blank' : undefined}
        rel={item.open_in_new_tab ? 'noreferrer' : undefined}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHaspopup}
        onClick={onNavigate}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      to={href}
      className={className}
      style={style}
      aria-current={ariaCurrent}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      onClick={onNavigate}
    >
      {content}
    </Link>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
