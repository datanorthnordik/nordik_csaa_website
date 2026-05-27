import type { PageDetailResponse, PageSection } from '../../api/pagesApi'
import { SharedImageHero } from '../SharedImageHero'
import { resolvePageHeroImageUrl } from './cmsPageMedia'
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
  const description = header.description?.trim() ?? ''
  const textAlign = header.text_align?.trim().toLowerCase()
  const alignmentClass =
    textAlign === 'center'
      ? styles.alignCenter
      : textAlign === 'right'
        ? styles.alignRight
        : styles.alignLeft
  const heroTitle = mainHeaderText || page.page_title.trim()
  const heroEyebrow = description ? subHeaderText : ''
  const heroDescription = description || subHeaderText || page.seo_page_description.trim()
  const sectionTitle = mainHeaderText
  const sectionEyebrow = subHeaderText
  const sectionDescription = description
  const showSectionRule = Boolean(header.underline_enabled)

  if (header.hierarchy === 'h1_hero') {
    return (
      <SharedImageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        description={heroDescription}
        backgroundImageUrl={imageUrl}
        testId="cms-header-hero"
      />
    )
  }

  return (
    <section className={`${styles.section} ${styles.simpleHeaderSection}`}>
      <div className={`${styles.simpleHeaderCard} ${alignmentClass}`}>
        {sectionEyebrow ? <p className={styles.sectionEyebrow}>{sectionEyebrow}</p> : null}
        {sectionTitle && <h2 className={styles.sectionTitle}>{sectionTitle}</h2>}
        {showSectionRule ? <div className={styles.sectionRule} aria-hidden="true" /> : null}
        {sectionDescription ? <p className={styles.sectionSummary}>{sectionDescription}</p> : null}
      </div>
    </section>
  )
}
