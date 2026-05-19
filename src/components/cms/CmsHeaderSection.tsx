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
  const eyebrow =
    normalizeCmsLabel(page.page_title) !== normalizeCmsLabel(header.main_header_text)
      ? page.page_title
      : page.parent_page_title

  if (header.hierarchy === 'h1_hero') {
    return (
      <section className={`${styles.section} ${styles.heroSection}`}>
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h1 className={styles.heroTitle}>
              {header.main_header_text || page.page_title}
            </h1>
            {header.sub_header_text || page.seo_page_description ? (
              <p className={styles.heroSummary}>
                {header.sub_header_text || page.seo_page_description}
              </p>
            ) : null}
          </div>

          <CmsHeroMedia
            imageUrl={imageUrl}
            title={header.main_header_text || page.page_title}
          />
        </div>
      </section>
    )
  }

  return (
    <section className={`${styles.section} ${styles.simpleHeaderSection}`}>
      <div className={styles.simpleHeaderCard}>
        {eyebrow ? <p className={styles.sectionEyebrow}>{eyebrow}</p> : null}
        <h2 className={styles.sectionTitle}>
          {header.main_header_text || section.section_name}
        </h2>
        {header.sub_header_text ? (
          <p className={styles.sectionSummary}>{header.sub_header_text}</p>
        ) : null}
      </div>
    </section>
  )
}
