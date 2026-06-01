import { TextHero } from './TextHero'
import styles from './SharedImageHero.module.css'

const WAVE_CURVE = 'M0,45 C400,45 450,95 700,95 C1000,95 1100,25 1300,25 C1380,25 1410,35 1440,35'

type SharedImageHeroProps = {
  eyebrow?: string
  title: string
  description?: string
  backgroundImageUrl?: string | null
  backgroundPosition?: string
  cta?: {
    href: string
    label: string
  }
  testId?: string
}

export function SharedImageHero({
  eyebrow = '',
  title,
  description = '',
  backgroundImageUrl = null,
  backgroundPosition = 'center 30%',
  cta,
  testId,
}: SharedImageHeroProps) {
  if (!backgroundImageUrl) {
    return (
      <div data-testid={testId}>
        <TextHero eyebrow={eyebrow || undefined} title={title} description={description || undefined} />
      </div>
    )
  }

  return (
    <section className={styles.hero} data-testid={testId}>
      <img
        src={backgroundImageUrl}
        alt=""
        aria-hidden="true"
        className={styles.heroImage}
        style={{ objectPosition: backgroundPosition }}
        data-testid={testId ? `${testId}-background` : undefined}
      />
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.heroContent}>
        {eyebrow ? <p className={styles.heroEyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.heroTitle}>{title}</h1>
        {description ? <p className={styles.heroDescription}>{description}</p> : null}
        {cta ? (
          <a href={cta.href} className={styles.heroCta}>
            {cta.label}
          </a>
        ) : null}
      </div>

      <div className={styles.waveDivider}>
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className={styles.waveSvg}
          aria-hidden="true"
        >
          <path d={`${WAVE_CURVE} L1440,120 L0,120 Z`} fill="#ffffff" />
        </svg>
      </div>
    </section>
  )
}
