import type { PageDetailResponse } from '../../api/pagesApi'
import { CmsHeroMedia } from './CmsHeroMedia'
import { resolvePageHeroImageUrl } from './cmsPageMedia'
import styles from './CmsSectionBlocks.module.css'

type CmsFallbackHeroProps = {
  page: PageDetailResponse
}

export function CmsFallbackHero({ page }: CmsFallbackHeroProps) {
  const imageUrl = resolvePageHeroImageUrl(page)

  return (
    <section className={`${styles.section} ${styles.heroSection}`}>
      <div className={styles.heroCard}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{page.page_title}</p>
          <h1 className={styles.heroTitle}>{page.page_title}</h1>
          {page.seo_page_description ? (
            <p className={styles.heroSummary}>{page.seo_page_description}</p>
          ) : null}
        </div>

        <CmsHeroMedia imageUrl={imageUrl} title={page.page_title} />
      </div>
    </section>
  )
}
