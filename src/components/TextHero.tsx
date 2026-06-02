import type { ReactNode } from 'react'
import styles from './TextHero.module.css'

const WAVE_CURVE = 'M0,45 C400,45 450,95 700,95 C1000,95 1100,25 1300,25 C1380,25 1410,35 1440,35'

type TextHeroProps = {
  eyebrow?: string
  title: string
  description?: string
  /** Rendered below the description — use for CTA buttons, action rows, etc. */
  children?: ReactNode
  /** Fill colour of the wave — should match the first section below the hero */
  waveFill?: string
}

export function TextHero({
  eyebrow,
  title,
  description,
  children,
  waveFill = '#f2f5f4',
}: TextHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {children && <div className={styles.actions}>{children}</div>}
      </div>

      <div className={styles.waveDivider} aria-hidden="true">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className={styles.waveSvg}
        >
          <path d={`${WAVE_CURVE} L1440,120 L0,120 Z`} fill={waveFill} />
        </svg>
      </div>
    </section>
  )
}
