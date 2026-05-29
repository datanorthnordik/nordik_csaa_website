import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import styles from './OurStoryPage.module.css'

/* S-curve wave: starts mid-left, dips down, rises back up on the right */
const WAVE_CURVE = 'M0,45 C400,45 450,95 700,95 C1000,95 1100,25 1300,25 C1380,25 1410,35 1440,35'

function WaveDivider() {
  return (
    <div className={styles.waveDivider}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={styles.waveSvg}
        aria-hidden="true"
      >
        {/* White fill closes the shape down to the bottom edge */}
        <path
          d={`${WAVE_CURVE} L1440,120 L0,120 Z`}
          fill="#f8f6f4"
        />
        {/* Red stroke traces the wave edge — non-scaling so it stays consistent at any width */}
        <path
          d={WAVE_CURVE}
          fill="none"
          stroke="#9c0000"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

export function OurStoryPage() {
  const { t } = useTranslation()

  usePageBreadcrumbs([
    {
      label: t('site.breadcrumbs.ourStory'),
    },
  ])

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${WEBSITE_ASSET_URLS.irsVector})` }}
          aria-hidden="true"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('ourStory.hero.title')}</h1>
          <p className={styles.heroDescription}>{t('ourStory.hero.description')}</p>
          <a href="#mission" className={styles.heroCta}>
            {t('ourStory.hero.cta')}
            <ArrowDownIcon />
          </a>
        </div>
        <WaveDivider />
      </section>

      {/* ── Mission & Vision ── */}
      <section id="mission" className={styles.missionSection}>
        <div className={styles.missionGrid}>
          <div className={styles.missionText}>
            <p className={styles.missionEyebrow}>{t('ourStory.mission.eyebrow')}</p>
            <h2 className={styles.missionTitle}>{t('ourStory.mission.title')}</h2>
            <div className={styles.missionRule} aria-hidden="true" />
            <p className={styles.missionBody}>{t('ourStory.mission.body1')}</p>
            <p className={styles.missionBody}>{t('ourStory.mission.body2')}</p>
          </div>
          <div className={styles.missionImageWrap}>
            <div className={styles.missionImageGlow} aria-hidden="true" />
            <img
              src={WEBSITE_ASSET_URLS.makwa17}
              alt={t('ourStory.mission.imageAlt')}
              className={styles.missionImage}
            />
          </div>
        </div>
      </section>

      {/* ── Explore Our Legacy ── */}
      <section className={styles.legacySection}>
        <div className={styles.legacyHeader}>
          <h2 className={styles.legacyTitle}>{t('ourStory.legacy.title')}</h2>
          <p className={styles.legacyDescription}>{t('ourStory.legacy.description')}</p>
        </div>
        <div className={styles.legacyGrid}>
          <LegacyCard
            imageSrc={WEBSITE_ASSET_URLS.watercolorMeadow}
            title={t('ourStory.legacy.csaaLegacy.title')}
            description={t('ourStory.legacy.csaaLegacy.description')}
            href="/our-story/csaa-legacy"
            action={t('ourStory.legacy.csaaLegacy.action')}
          />
          <LegacyCard
            imageSrc={WEBSITE_ASSET_URLS.cryingRockHero}
            title={t('ourStory.legacy.healingMemorials.title')}
            description={t('ourStory.legacy.healingMemorials.description')}
            href="/our-story/healing-memorials"
            action={t('ourStory.legacy.healingMemorials.action')}
          />
          <LegacyCard
            imageSrc={WEBSITE_ASSET_URLS.everyChildMattersHero}
            title={t('ourStory.legacy.archives.title')}
            description={t('ourStory.legacy.archives.description')}
            href="https://srsc.algomau.ca/"
            action={t('ourStory.legacy.archives.action')}
            isExternal
            isLogo
          />
        </div>
      </section>

      {/* ── Foundations of Our Journey ── */}
      <section className={styles.foundationsSection}>
        <div className={styles.foundationsDecor} aria-hidden="true" />
        <div className={styles.foundationsInner}>
          <div className={styles.foundationsHeadCol}>
            <h2 className={styles.foundationsTitle}>{t('ourStory.foundations.title')}</h2>
          </div>
          <div className={styles.foundationsTimeline}>
            <TimelineItem
              label={t('ourStory.foundations.origins.label')}
              body={t('ourStory.foundations.origins.body')}
              accent
            />
            <TimelineItem
              label={t('ourStory.foundations.closure.label')}
              body={t('ourStory.foundations.closure.body')}
            />
            <TimelineItem
              label={t('ourStory.foundations.reunion.label')}
              body={t('ourStory.foundations.reunion.body')}
            />
            <TimelineItem
              label={t('ourStory.foundations.today.label')}
              body={t('ourStory.foundations.today.body')}
            />
          </div>
        </div>
      </section>

      {/* ── Solemn Dedication ── */}
      <section className={styles.dedicationSection}>
        <img
          src={WEBSITE_ASSET_URLS.csaaLogo}
          alt="CSAA Logo"
          className={styles.dedicationLogo}
        />
        <blockquote className={styles.dedicationQuote}>
          {t('ourStory.dedication.quote')}
        </blockquote>
        <div className={styles.dedicationRule} aria-hidden="true">
          <span className={styles.dedicationRuleLine} />
          <span className={styles.dedicationRuleText}>{t('ourStory.dedication.attribution')}</span>
          <span className={styles.dedicationRuleLine} />
        </div>
      </section>

    </div>
  )
}

/* ─── Legacy Card ─── */

type LegacyCardProps = {
  imageSrc: string
  title: string
  description: string
  href: string
  action: string
  isExternal?: boolean
  isLogo?: boolean
}

function LegacyCard({ imageSrc, title, description, href, action, isExternal = false, isLogo = false }: LegacyCardProps) {
  const externalProps = isExternal
    ? { target: '_blank', rel: 'noreferrer noopener' }
    : {}

  const ImageWrapper = ({ children, className }: { children: React.ReactNode; className: string }) =>
    isExternal ? (
      <a href={href} className={className} tabIndex={-1} aria-hidden="true" {...externalProps}>{children}</a>
    ) : (
      <Link to={href} className={className} tabIndex={-1} aria-hidden="true">{children}</Link>
    )

  const CardLink = ({ children, className }: { children: React.ReactNode; className: string }) =>
    isExternal ? (
      <a href={href} className={className} {...externalProps}>{children}</a>
    ) : (
      <Link to={href} className={className}>{children}</Link>
    )

  return (
    <article className={styles.legacyCard}>
      <ImageWrapper className={styles.legacyCardImageLink}>
        <img
          src={imageSrc}
          alt=""
          className={isLogo ? styles.legacyCardImageLogo : styles.legacyCardImage}
        />
      </ImageWrapper>
      <div className={styles.legacyCardBody}>
        <h3 className={styles.legacyCardTitle}>
          <CardLink className={styles.legacyCardTitleLink}>{title}</CardLink>
        </h3>
        <p className={styles.legacyCardDescription}>{description}</p>
        <CardLink className={styles.legacyCardLink}>
          {action} →
        </CardLink>
      </div>
    </article>
  )
}

/* ─── Timeline Item ─── */

type TimelineItemProps = {
  label: string
  body: string
  accent?: boolean
}

function TimelineItem({ label, body, accent = false }: TimelineItemProps) {
  return (
    <div className={accent ? styles.timelineItemAccent : styles.timelineItem}>
      <h4 className={accent ? styles.timelineLabelAccent : styles.timelineLabel}>{label}</h4>
      <p className={styles.timelineBody}>{body}</p>
    </div>
  )
}

/* ─── Icons ─── */

function ArrowDownIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  )
}

