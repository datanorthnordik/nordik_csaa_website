import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import { TextHero } from '../components/TextHero'
import { usePageSeo } from '../lib/usePageSeo'
import styles from './NewsMediaLandingPage.module.css'

const PRESS_INQUIRIES_IMAGE_WIDTH = 1200
const PRESS_INQUIRIES_IMAGE_HEIGHT = 900

export function NewsMediaLandingPage() {
  const { i18n, t } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const seoTitle = t('newsMediaPage.seo.title')
  const seoDescription = t('newsMediaPage.seo.description')

  usePageBreadcrumbs([
    {
      label: t('newsMediaPage.hero.title'),
    },
  ])

  usePageSeo({
    title: seoTitle,
    description: seoDescription,
    canonicalPath: '/news-media',
    image: WEBSITE_ASSET_URLS.mediaLanding,
    lang: locale,
  })

  return (
    <div className={styles.page}>
      <TextHero
        eyebrow={t('newsMediaPage.hero.eyebrow')}
        title={t('newsMediaPage.hero.title')}
        description={t('newsMediaPage.hero.description')}
        waveFill="#f2f5f4"
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
              src={WEBSITE_ASSET_URLS.mediaLanding}
              alt={t('newsMediaPage.pressInquiries.imageAlt')}
              className={styles.inquiriesImage}
              width={PRESS_INQUIRIES_IMAGE_WIDTH}
              height={PRESS_INQUIRIES_IMAGE_HEIGHT}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              sizes="(max-width: 900px) 100vw, 440px"
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
