import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import shingwaukHero from '../assets/irs_vector.jpeg'
import missionImg from '../assets/makwa17.jpg'
import legacyImg from '../assets/watercolor_meadow.png'
import memorialsImg from '../assets/cryingrock-hero.png'
import archivesImg from '../assets/every-child-matters-hero.jpg'
import { QuoteBanner } from '../components/QuoteBanner'
import styles from './OurStoryPage.module.css'

const WAVE_PATH =
  'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,100.8,118.42,100.34,176.49,90.47,227,81.86,276.54,64.74,321.39,56.44Z'

function WaveDivider({ fill }: { fill: string }) {
  return (
    <div className={styles.waveDivider}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={styles.waveSvg}
        style={{ fill }}
        aria-hidden="true"
      >
        <path d={WAVE_PATH} />
      </svg>
    </div>
  )
}

export function OurStoryPage() {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${shingwaukHero})` }}
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
        <WaveDivider fill="#f2f5f4" />
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
              src={missionImg}
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
            imageSrc={legacyImg}
            title={t('ourStory.legacy.csaaLegacy.title')}
            description={t('ourStory.legacy.csaaLegacy.description')}
            href="#"
            action={t('ourStory.legacy.csaaLegacy.action')}
          />
          <LegacyCard
            imageSrc={memorialsImg}
            title={t('ourStory.legacy.healingMemorials.title')}
            description={t('ourStory.legacy.healingMemorials.description')}
            href="/our-story/healing-memorials"
            action={t('ourStory.legacy.healingMemorials.action')}
          />
          <LegacyCard
            imageSrc={archivesImg}
            title={t('ourStory.legacy.archives.title')}
            description={t('ourStory.legacy.archives.description')}
            href="#"
            action={t('ourStory.legacy.archives.action')}
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
      <QuoteBanner
        quote={t('ourStory.dedication.quote')}
        attribution={t('ourStory.dedication.attribution')}
      />

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
}

function LegacyCard({ imageSrc, title, description, href, action }: LegacyCardProps) {
  return (
    <article className={styles.legacyCard}>
      <Link to={href} className={styles.legacyCardImageLink} tabIndex={-1} aria-hidden="true">
        <img src={imageSrc} alt="" className={styles.legacyCardImage} />
      </Link>
      <div className={styles.legacyCardBody}>
        <h3 className={styles.legacyCardTitle}>
          <Link to={href} className={styles.legacyCardTitleLink}>{title}</Link>
        </h3>
        <p className={styles.legacyCardDescription}>{description}</p>
        <Link to={href} className={styles.legacyCardLink}>
          {action} →
        </Link>
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

