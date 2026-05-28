import type { PageSection } from '../../api/pagesApi'
import { resolveCmsAssetUrl } from './cmsPageMedia'
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
  const imageUrl = resolveCmsAssetUrl(cta.image?.fetch_url || cta.image?.file_url)
  const hasImage = Boolean(imageUrl)

  return (
    <section className={`${styles.section} ${styles.ctaSection}`}>
      <div
        className={`${styles.ctaCard} ${
          hasImage ? styles.ctaCardWithImage : styles.ctaCardCentered
        }`}
      >
        {hasImage ? (
          <div className={styles.ctaMedia}>
            <img
              src={imageUrl ?? ''}
              alt={cta.banner_heading || 'CTA image'}
              className={styles.ctaImage}
              loading="lazy"
            />
          </div>
        ) : null}

        <div className={styles.ctaCopy}>
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
      </div>
    </section>
  )
}
