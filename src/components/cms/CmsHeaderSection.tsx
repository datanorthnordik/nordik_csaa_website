import type { PageDetailResponse, PageSection } from '../../api/pagesApi'
import { CmsHeroMedia } from './CmsHeroMedia'
import { normalizeCmsLabel, resolveCmsAssetUrl } from './cmsPageMedia'
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

  const imageUrl = isPrimaryHeader
    ? resolveCmsAssetUrl(page.hero_image_fetch_url)
    : null
  const mainHeaderText = header.main_header_text.trim()
  const subHeaderText = header.sub_header_text.trim()
  const textAlign = header.text_align?.trim().toLowerCase()
  const alignmentClass =
    textAlign === 'center'
      ? styles.alignCenter
      : textAlign === 'right'
        ? styles.alignRight
        : styles.alignLeft
<<<<<<< HEAD
  const heroTitle = mainHeaderText || page.page_title
  const sectionTitle = mainHeaderText || section.section_name
  const heroSummary = subHeaderText || page.seo_page_description
  const eyebrow =
    isPrimaryHeader
      ? normalizeCmsLabel(page.page_title) !== normalizeCmsLabel(heroTitle)
        ? page.page_title
        : page.parent_page_title
      : normalizeCmsLabel(page.page_title) === normalizeCmsLabel(sectionTitle)
        ? page.parent_page_title
        : ''
=======
  const heroTitle = mainHeaderText || page.page_title.trim()
  const heroEyebrow = description ? subHeaderText : ''
  const heroDescription = description || subHeaderText
  const sectionTitle = mainHeaderText
  const sectionEyebrow = subHeaderText
  const sectionDescription = description
  const showSectionRule = Boolean(header.underline_enabled)
>>>>>>> 7c0fbf18d0265774dcd451f52c7f4852d611d0ee

  if (header.hierarchy === 'h1_hero') {
    return (
      <section className={`${styles.section} ${styles.heroSection}`}>
        <div className={styles.heroCard}>
          <div className={`${styles.heroCopy} ${alignmentClass}`}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            {heroSummary ? <p className={styles.heroSummary}>{heroSummary}</p> : null}
          </div>

          <CmsHeroMedia imageUrl={imageUrl} title={heroTitle} showFallback={false} />
        </div>
      </section>
    )
  }

  return (
    <section className={`${styles.section} ${styles.simpleHeaderSection}`}>
      <div className={`${styles.simpleHeaderCard} ${alignmentClass}`}>
        {eyebrow ? <p className={styles.sectionEyebrow}>{eyebrow}</p> : null}
        <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
        {subHeaderText ? <p className={styles.sectionSummary}>{subHeaderText}</p> : null}
      </div>
    </section>
  )
}
