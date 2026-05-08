import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import styles from './SiteShell.module.css'

export function SiteShell() {
  const { t } = useTranslation()

  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <p className={styles.eyebrow}>{t('site.header.eyebrow')}</p>
          <p className={styles.brand}>{t('site.header.title')}</p>
          <p className={styles.tagline}>{t('site.header.tagline')}</p>
        </div>

        <LanguageSwitcher />
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
