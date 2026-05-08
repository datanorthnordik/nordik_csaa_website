import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SiteHeader } from './SiteHeader'
import styles from './SiteShell.module.css'

export function SiteShell() {
  const { t } = useTranslation()

  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} aria-hidden="true" />

      <div className={styles.frame}>
        <SiteHeader />

        <main className={styles.main}>
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
  )
}
