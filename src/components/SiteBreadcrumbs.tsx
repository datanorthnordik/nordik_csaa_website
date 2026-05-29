import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  normalizeBreadcrumbItems,
  type BreadcrumbItem,
} from '../lib/breadcrumbs'
import styles from './SiteBreadcrumbs.module.css'

const BreadcrumbOverrideContext = createContext<((items: BreadcrumbItem[] | null) => void) | null>(null)

export function BreadcrumbOverrideProvider({
  children,
  onItemsChange,
}: {
  children: ReactNode
  onItemsChange: (items: BreadcrumbItem[] | null) => void
}) {
  return (
    <BreadcrumbOverrideContext.Provider value={onItemsChange}>
      {children}
    </BreadcrumbOverrideContext.Provider>
  )
}

export function SiteBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useTranslation()
  const normalizedItems = useMemo(() => {
    const trail = normalizeBreadcrumbItems(items)

    return trail.map((item, index) => ({
      ...item,
      href: index === trail.length - 1 ? undefined : item.href,
    }))
  }, [items])

  if (normalizedItems.length < 2) {
    return null
  }

  return (
    <nav
      aria-label={t('site.breadcrumbs.ariaLabel')}
      className={styles.breadcrumbs}
      data-testid="site-breadcrumbs"
    >
      <ol className={styles.list}>
        {normalizedItems.map((item, index) => {
          const isCurrentPage = index === normalizedItems.length - 1

          return (
            <li key={`${item.label}-${item.href ?? 'current'}`} className={styles.item}>
              {item.href ? (
                <Link to={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className={styles.current}
                  aria-current={isCurrentPage ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isCurrentPage ? (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function usePageBreadcrumbs(items: BreadcrumbItem[] | null) {
  const setOverrideItems = useContext(BreadcrumbOverrideContext)
  const serializedItems = JSON.stringify(items ?? [])
  const normalizedItems = useMemo(
    () =>
      normalizeBreadcrumbItems(
        JSON.parse(serializedItems) as BreadcrumbItem[],
      ),
    [serializedItems],
  )

  useEffect(() => {
    if (!setOverrideItems) {
      return
    }

    setOverrideItems(normalizedItems.length ? normalizedItems : null)

    return () => {
      setOverrideItems(null)
    }
  }, [normalizedItems, setOverrideItems])
}
