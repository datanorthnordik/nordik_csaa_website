import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import styles from './HealingMemorialsPage.module.css'

type Pillar = {
  key: string
  href: string
  imageSrc?: string
  gradient: string
}

const PILLARS: Pillar[] = [
  {
    key: 'inMemorial',
    href: '/our-story/healing-memorials/in-memorial',
    imageSrc: WEBSITE_ASSET_URLS.watercolorMeadow,
    gradient: 'linear-gradient(160deg, #2a2018 0%, #3e2e20 50%, #1a1510 100%)',
  },
  {
    key: 'exhibition',
    href: '/our-story/healing-memorials/shingwauk-hall-exhibition',
    imageSrc: WEBSITE_ASSET_URLS.shingwaukHallHero,
    gradient: 'linear-gradient(160deg, #c8b89a 0%, #9a8870 40%, #5a4838 100%)',
  },
  {
    key: 'everyChild',
    href: '/our-story/healing-memorials/every-child-matters',
    imageSrc: WEBSITE_ASSET_URLS.everyChildMattersHero,
    gradient: 'linear-gradient(160deg, #c84800 0%, #a03810 50%, #6a2808 100%)',
  },
  {
    key: 'cryingRock',
    href: '/our-story/healing-memorials/crying-rock',
    imageSrc: WEBSITE_ASSET_URLS.cryingRockHero,
    gradient: 'linear-gradient(160deg, #1a3018 0%, #2a4828 50%, #0a1808 100%)',
  },
  {
    key: 'wawnosh',
    href: '/our-story/healing-memorials/wawanosh-memorial-project',
    imageSrc: WEBSITE_ASSET_URLS.wawnoshHeroSection,
    gradient: 'linear-gradient(160deg, #1a2830 0%, #2a3840 50%, #0a1820 100%)',
  },
]

export function HealingMemorialsPage() {
  const { t } = useTranslation()

  usePageBreadcrumbs([
    {
      label: t('site.breadcrumbs.ourStory'),
      href: '/our-story',
    },
    {
      label: t('healingMemorials.hero.title'),
    },
  ])

  return (
    <div className={styles.page}>
      <SharedImageHero
        title={t('healingMemorials.hero.title')}
        description={t('healingMemorials.hero.description')}
        backgroundImageUrl={WEBSITE_ASSET_URLS.healingHeroSection}
        cta={{
          href: '#pillars',
          label: t('healingMemorials.hero.cta'),
        }}
      />

      <section
        id="pillars"
        className={styles.pillarsSection}
        aria-label={t('healingMemorials.pillars.label')}
      >
        <div className={styles.pillarsHeader}>
          <p className={styles.pillarsEyebrow}>{t('healingMemorials.pillars.eyebrow')}</p>
          <h2 className={styles.pillarsTitle}>{t('healingMemorials.pillars.title')}</h2>
          <div className={styles.pillarsRule} aria-hidden="true" />
        </div>
        <div className={styles.pillarsGrid}>
          {PILLARS.map(({ key, href, imageSrc, gradient }) => (
            <PillarCard
              key={key}
              title={t(`healingMemorials.pillars.${key}.title`)}
              description={t(`healingMemorials.pillars.${key}.description`)}
              href={href}
              imageSrc={imageSrc}
              gradient={gradient}
              learnMore={t('healingMemorials.pillars.learnMore')}
            />
          ))}
        </div>
      </section>

      <section className={styles.supportSection}>
        <h2 className={styles.supportTitle}>{t('healingMemorials.support.title')}</h2>
        <p className={styles.supportDescription}>{t('healingMemorials.support.description')}</p>
        <div className={styles.supportActions}>
          <Link to="/get-involved#make-donations" className={styles.donateButton}>
            {t('healingMemorials.support.donate')}
          </Link>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScW1dDZhiLBCUgaLi_NbUbOOOW-PrcOxwqC8pewhtxp95oJOw/viewform?usp=preview"
            target="_blank"
            rel="noreferrer"
            className={styles.joinButton}
          >
            {t('healingMemorials.support.join')}
          </a>
        </div>
      </section>
    </div>
  )
}

type PillarCardProps = {
  title: string
  description: string
  href: string
  imageSrc?: string
  gradient: string
  learnMore: string
}

function PillarCard({ title, description, href, imageSrc, gradient, learnMore }: PillarCardProps) {
  return (
    <article className={styles.pillarCard}>
      <Link to={href} className={styles.cardImageLink} tabIndex={-1} aria-hidden="true">
        {imageSrc ? (
          <img src={imageSrc} alt="" className={styles.cardImage} />
        ) : (
          <div className={styles.cardImagePlaceholder} style={{ background: gradient }} />
        )}
      </Link>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          <Link to={href} className={styles.cardTitleLink}>
            {title}
          </Link>
        </h3>
        <p className={styles.cardDescription}>{description}</p>
        <Link to={href} className={styles.cardLink}>
          {learnMore}
          {' ->'}
        </Link>
      </div>
    </article>
  )
}
