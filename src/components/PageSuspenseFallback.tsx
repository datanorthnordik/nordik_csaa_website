import { useTranslation } from 'react-i18next'
import styles from './PageSuspenseFallback.module.css'

export function PageSuspenseFallback() {
  const { t } = useTranslation()

  return (
    <div className={styles.page} aria-busy="true" aria-live="polite">
      <span className={styles.visuallyHidden}>{t('common.loading')}</span>

      <section className={styles.hero} aria-hidden="true">
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <span className={`${styles.bar} ${styles.eyebrow}`} />
          <span className={`${styles.bar} ${styles.title}`} />
          <span className={`${styles.bar} ${styles.titleShort}`} />
          <span className={`${styles.bar} ${styles.body}`} />
          <span className={`${styles.bar} ${styles.bodyWide}`} />
        </div>
      </section>

      <section className={styles.section} aria-hidden="true">
        <div className={styles.card}>
          <span className={`${styles.bar} ${styles.sectionTitle}`} />
          <span className={`${styles.bar} ${styles.sectionBody}`} />
          <span className={`${styles.bar} ${styles.sectionBodyWide}`} />
        </div>
      </section>

      <section className={styles.section} aria-hidden="true">
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.tile} />
          ))}
        </div>
      </section>
    </div>
  )
}
