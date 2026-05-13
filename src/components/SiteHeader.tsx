import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/events" className={styles.brand}>
          {t('site.header.title')}
        </Link>

        <nav className={styles.nav} aria-label={t('site.nav.ariaLabel')}>
          <span className={styles.navPlaceholder}>{t('site.nav.directory')}</span>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            {t('site.nav.gatherings')}
          </NavLink>
          <span className={styles.navPlaceholder}>{t('site.nav.protocols')}</span>
          <span className={styles.navPlaceholder}>{t('site.nav.sustainability')}</span>
          <span className={styles.navPlaceholder}>{t('site.nav.about')}</span>
        </nav>

        <div className={styles.headerActions}>
          <LanguageSwitcher />
          <a href="#site-footer" className={styles.joinUs}>
            {t('site.header.cta')}
          </a>
        </div>
      </div>
    </header>
  )
}
