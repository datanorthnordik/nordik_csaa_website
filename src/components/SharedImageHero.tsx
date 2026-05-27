import styles from './SharedImageHero.module.css'

const WAVE_PATH =
  'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,100.8,118.42,100.34,176.49,90.47,227,81.86,276.54,64.74,321.39,56.44Z'

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
  backgroundPosition = 'center top',
  cta,
  testId,
}: SharedImageHeroProps) {
  if (!backgroundImageUrl) {
    return (
      <section className={styles.plainHero} data-testid={testId}>
        <div className={styles.plainHeroContent}>
          <h1 className={styles.plainHeroTitle}>{title}</h1>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.hero} data-testid={testId}>
      <img
        src={backgroundImageUrl}
        alt=""
        className={styles.heroImage}
        style={{
          objectPosition: backgroundPosition,
        }}
        aria-hidden="true"
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
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className={styles.waveSvg}
          style={{ fill: '#ffffff' }}
          aria-hidden="true"
        >
          <path d={WAVE_PATH} />
        </svg>
      </div>
    </section>
  )
}
