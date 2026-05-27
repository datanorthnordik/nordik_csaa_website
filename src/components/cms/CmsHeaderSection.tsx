import type { PageDetailResponse, PageSection } from '../../api/pagesApi'
import { CmsHeroMedia } from './CmsHeroMedia'
import { normalizeCmsLabel, resolvePageHeroImageUrl } from './cmsPageMedia'
import styles from './CmsSectionBlocks.module.css'

type CmsHeaderSectionProps = {
  page: PageDetailResponse
  section: PageSection
  isPrimaryHeader: boolean
}

export function CmsHeaderSection({
  page,
  section,
  isPrimaryHeader,
}: CmsHeaderSectionProps) {
  const header = section.header
  if (!header) {
    return null
  }

  const imageUrl = isPrimaryHeader ? resolvePageHeroImageUrl(page) : null
  const mainHeaderText = header.main_header_text.trim()
  const subHeaderText = header.sub_header_text.trim()
  const textAlign = header.text_align?.trim().toLowerCase()
  const alignmentClass =
    textAlign === 'center'
      ? styles.alignCenter
      : textAlign === 'right'
        ? styles.alignRight
        : styles.alignLeft
  const heroTitle = mainHeaderText
  const sectionTitle = mainHeaderText
  const eyebrow =
    isPrimaryHeader
      ? page.parent_page_title
      : ''

  if (header.hierarchy === 'h1_hero') {
    return (
      <section className={`${styles.section} ${styles.heroSection}`}>
        <div className={styles.heroCard}>
          <div className={`${styles.heroCopy} ${alignmentClass}`}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {heroTitle && <h1 className={styles.heroTitle}>{heroTitle}</h1>}
            {subHeaderText ? <p className={styles.heroSummary}>{subHeaderText}</p> : null}
          </div>

          <CmsHeroMedia imageUrl={imageUrl} title={heroTitle || page.page_title} showFallback={false} />
        </div>
      </section>
    )
  }

  return (
    <section className={`${styles.section} ${styles.simpleHeaderSection}`}>
      <div className={`${styles.simpleHeaderCard} ${alignmentClass}`}>
        {eyebrow ? <p className={styles.sectionEyebrow}>{eyebrow}</p> : null}
        {sectionTitle && <h2 className={styles.sectionTitle}>{sectionTitle}</h2>}
        {subHeaderText ? <p className={styles.sectionSummary}>{subHeaderText}</p> : null}
      </div>
    </section>
  )
}
