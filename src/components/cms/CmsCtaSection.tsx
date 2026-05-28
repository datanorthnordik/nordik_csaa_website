import type { PageSection } from '../../api/pagesApi'
import styles from './CmsSectionBlocks.module.css'

type CmsCtaSectionProps = {
  section: PageSection
}

export function CmsCtaSection({ section }: CmsCtaSectionProps) {
  const cta = section.cta_banner
  if (!cta) {
    return null
  }

  const href = cta.button_url.trim()

  return (
    <section className={`${styles.section} ${styles.ctaSection}`}>
      <div className={styles.ctaCard}>
        {cta.banner_heading ? (
          <h2 className={styles.ctaHeading}>{cta.banner_heading}</h2>
        ) : null}
        {cta.banner_message ? (
          <p className={styles.ctaMessage}>{cta.banner_message}</p>
        ) : null}
        {href && cta.button_text ? (
          <a
            className={styles.ctaButton}
            href={href}
            target={cta.open_in_new_tab ? '_blank' : undefined}
            rel={cta.open_in_new_tab ? 'noreferrer' : undefined}
          >
            {cta.button_text}
          </a>
        ) : null}
      </div>
    </section>
  )
}
