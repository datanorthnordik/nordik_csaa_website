import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import healingHero from '../assets/healing hero section.jpg'
import shingwaukHallImg from '../assets/shingwaukhall-hero.jpg'
import everyChildImg from '../assets/every-child-matters-hero.jpg'
import wawnoshImg from '../assets/wawnosh-hero-section.jpg'
import cryingRockImg from '../assets/cryingrock-hero.png'
import watercolorMeadow from '../assets/watercolor_meadow.png'
import styles from './HealingMemorialsPage.module.css'

/* ─── Wave SVG divider ─── */
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
    imageSrc: watercolorMeadow,
    gradient: 'linear-gradient(160deg, #2a2018 0%, #3e2e20 50%, #1a1510 100%)',
  },
  {
    key: 'exhibition',
    href: '/our-story/healing-memorials/shingwauk-hall-exhibition',
    imageSrc: shingwaukHallImg,
    gradient: 'linear-gradient(160deg, #c8b89a 0%, #9a8870 40%, #5a4838 100%)',
  },
  {
    key: 'everyChild',
    href: '/our-story/healing-memorials/every-child-matters',
    imageSrc: everyChildImg,
    gradient: 'linear-gradient(160deg, #c84800 0%, #a03810 50%, #6a2808 100%)',
  },
  {
    key: 'cryingRock',
    href: '/our-story/healing-memorials/crying-rock',
    imageSrc: cryingRockImg,
    gradient: 'linear-gradient(160deg, #1a3018 0%, #2a4828 50%, #0a1808 100%)',
  },
  {
    key: 'wawnosh',
    href: '/our-story/healing-memorials/wawanosh-memorial-project',
    imageSrc: wawnoshImg,
    gradient: 'linear-gradient(160deg, #1a2830 0%, #2a3840 50%, #0a1820 100%)',
  },
]

/* ─── Page ─── */
export function HealingMemorialsPage() {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${healingHero})` }}
          aria-hidden="true"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('healingMemorials.hero.title')}</h1>
          <p className={styles.heroDescription}>{t('healingMemorials.hero.description')}</p>
          <a href="#pillars" className={styles.heroCta}>
            {t('healingMemorials.hero.cta')}
          </a>
        </div>
        <WaveDivider fill="#ffffff" />
      </section>

      {/* ── Community Pillars ── */}
      <section id="pillars" className={styles.pillarsSection} aria-label={t('healingMemorials.pillars.label')}>
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

      {/* ── Support ── */}
      <section className={styles.supportSection}>
        <h2 className={styles.supportTitle}>{t('healingMemorials.support.title')}</h2>
        <p className={styles.supportDescription}>{t('healingMemorials.support.description')}</p>
        <div className={styles.supportActions}>
          <Link to="/donate" className={styles.donateButton}>
            {t('healingMemorials.support.donate')}
          </Link>
          <Link to="/membership" className={styles.joinButton}>
            {t('healingMemorials.support.join')}
          </Link>
        </div>
      </section>

    </div>
  )
}

/* ─── Pillar Card ─── */
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
          <Link to={href} className={styles.cardTitleLink}>{title}</Link>
        </h3>
        <p className={styles.cardDescription}>{description}</p>
        <Link to={href} className={styles.cardLink}>
          {learnMore} →
        </Link>
      </div>
    </article>
  )
}
