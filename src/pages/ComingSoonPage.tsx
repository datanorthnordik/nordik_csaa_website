import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNavigationMenu } from '../components/NavigationMenuProvider'
import { findMenuItemByPath, formatPathLabel } from '../lib/navigationMenu'
import styles from './ComingSoonPage.module.css'

export function ComingSoonPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { menu } = useNavigationMenu()
  const matchedItem = findMenuItemByPath(menu.items, pathname)
  const pageTitle = matchedItem?.label || formatPathLabel(pathname)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{pageTitle}</h1>
      <p className={styles.text}>{t('comingSoon.simpleMessage')}</p>
    </div>
  )
}
