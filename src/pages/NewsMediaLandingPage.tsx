import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { TextHero } from '../components/TextHero'
import styles from './NewsMediaLandingPage.module.css'

export function NewsMediaLandingPage() {
  const { t } = useTranslation()

  usePageBreadcrumbs([
    {
      label: t('newsMediaPage.hero.title'),
    },
  ])

  return (
    <div className={styles.page}>
      <TextHero
        eyebrow="News &amp; Media"
        title={t('newsMediaPage.hero.title')}
        description={t('newsMediaPage.hero.description')}
        waveFill="#f8f6f4"
      />

      {/* ── Cards ── */}
      <section className={styles.cardsSection}>
        <div className={styles.cardsSectionInner}>
          <div className={styles.cardsGrid}>
            <article className={styles.card}>
              <div className={styles.iconBox}>
                <NewsletterIcon />
              </div>
              <h2 className={styles.cardTitle}>{t('newsMediaPage.newsletter.title')}</h2>
              <p className={styles.cardDescription}>{t('newsMediaPage.newsletter.description')}</p>
              <Link to="/news-media/digital-newsletter" className={styles.primaryButton}>
                {t('newsMediaPage.newsletter.action')}
              </Link>
            </article>

            <article className={styles.card}>
              <div className={styles.iconBox}>
                <PressArchiveIcon />
              </div>
              <h2 className={styles.cardTitle}>{t('newsMediaPage.pressArchive.title')}</h2>
              <p className={styles.cardDescription}>{t('newsMediaPage.pressArchive.description')}</p>
              <Link to="/news-media/press-archive" className={styles.outlineButton}>
                {t('newsMediaPage.pressArchive.action')}
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── Press Inquiries ── */}
      <section className={styles.inquiries}>
        <div className={styles.inquiriesInner}>
          <div className={styles.inquiriesCopy}>
            <h2 className={styles.inquiriesTitle}>{t('newsMediaPage.pressInquiries.title')}</h2>
            <p className={styles.inquiriesDescription}>
              {t('newsMediaPage.pressInquiries.description')}
            </p>
            <Link to="/get-involved" className={styles.inquiriesLink}>
              {t('newsMediaPage.pressInquiries.action')}
              <span className={styles.arrowIcon} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.inquiriesImageWrap}>
            <img
              src="https://storage.googleapis.com/nordik-csa-website-assets/assets/media_landing.jpg"
              alt={t('newsMediaPage.pressInquiries.imageAlt')}
              className={styles.inquiriesImage}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function NewsletterIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="32" height="23" rx="3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 8l16 14L35 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 31l11-9M35 31l-11-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PressArchiveIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 4h16l10 10v24H8V4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 4v10h10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 20h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 27h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
