import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  buildDefaultBreadcrumbItems,
  getHomeBreadcrumbItem,
  normalizeBreadcrumbItems,
  type BreadcrumbItem,
} from '../lib/breadcrumbs'
import { normalizeInternalPath } from '../lib/navigationMenu'
import { useNavigationMenu } from './NavigationMenuProvider'
import {
  BreadcrumbOverrideProvider,
  SiteBreadcrumbs,
} from './SiteBreadcrumbs'
import { SiteHeader } from './SiteHeader'
import styles from './SiteShell.module.css'

export function SiteShell() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { menu } = useNavigationMenu()
  const [overrideItems, setOverrideItems] = useState<BreadcrumbItem[] | null>(null)

  const homeItem = useMemo(
    () => getHomeBreadcrumbItem(menu.items, t('site.breadcrumbs.home')),
    [menu.items, t],
  )
  const defaultItems = useMemo(
    () => buildDefaultBreadcrumbItems(pathname, menu.items, homeItem),
    [homeItem, menu.items, pathname],
  )
  const breadcrumbItems = useMemo(() => {
    const normalizedPath = normalizeInternalPath(pathname)
    const normalizedHomeHref = normalizeInternalPath(homeItem.href ?? '/')

    if (normalizedPath === '/' || normalizedPath === normalizedHomeHref) {
      return []
    }

    return normalizeBreadcrumbItems([
      homeItem,
      ...(overrideItems ?? defaultItems),
    ])
  }, [defaultItems, homeItem, overrideItems, pathname])

  return (
    <BreadcrumbOverrideProvider onItemsChange={setOverrideItems}>
      <div className={styles.shell}>
        <div className={styles.backdrop} aria-hidden="true" />

        <div className={styles.frame}>
          <SiteHeader />

          <main className={styles.main}>
            <SiteBreadcrumbs items={breadcrumbItems} />
            <Outlet />
          </main>

          <footer id="site-footer" className={styles.footer}>
            <div>
              <p className={styles.footerBrand}>{t('site.footer.title')}</p>
              <p className={styles.footerCopy}>{t('site.footer.copy')}</p>
            </div>

            <div className={styles.footerLinks}>
              <span>{t('site.footer.links.sustainability')}</span>
              <span>{t('site.footer.links.protocols')}</span>
              <span>{t('site.footer.links.guidelines')}</span>
              <span>{t('site.footer.links.contact')}</span>
            </div>
          </footer>
        </div>
      </div>
    </BreadcrumbOverrideProvider>
  )
}
