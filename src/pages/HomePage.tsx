import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import styles from './HomePage.module.css'

const statusKeys = [
  'site.hero.statusItems.i18n',
  'site.hero.statusItems.toast',
  'site.hero.statusItems.api',
  'site.hero.statusItems.store',
] as const

const cardKeys = ['localization', 'feedback', 'api'] as const

export function HomePage() {
  const { t } = useTranslation()

  const showToastPreview = () => {
    toast.success(t('site.toast.previewSuccess'))
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t('site.hero.eyebrow')}</p>
          <h1 className={styles.title}>{t('site.hero.title')}</h1>
          <p className={styles.description}>{t('site.hero.description')}</p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={showToastPreview}
            >
              {t('site.hero.primaryAction')}
            </button>

            <a className={styles.secondaryAction} href="#foundation">
              {t('site.hero.secondaryAction')}
            </a>
          </div>
        </div>

        <aside className={styles.statusPanel}>
          <p className={styles.statusTitle}>{t('site.hero.statusTitle')}</p>
          <ul className={styles.statusList}>
            {statusKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section id="foundation" className={styles.foundation}>
        <div className={styles.sectionHeader}>
          <h2>{t('site.section.title')}</h2>
          <p>{t('site.section.description')}</p>
        </div>

        <div className={styles.cardGrid}>
          {cardKeys.map((key) => (
            <article key={key} className={styles.card}>
              <h3>{t(`site.cards.${key}.title`)}</h3>
              <p>{t(`site.cards.${key}.description`)}</p>
            </article>
          ))}
        </div>

        <p className={styles.apiHint}>
          <code>VITE_API_BASE_URL</code> {t('site.apiHint')}
        </p>
      </section>
    </div>
  )
}
