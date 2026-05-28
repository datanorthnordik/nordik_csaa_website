import type { PageDetailResponse } from '../../api/pagesApi'
import { CmsHeroMedia } from './CmsHeroMedia'
import { resolveCmsAssetUrl } from './cmsPageMedia'
import styles from './CmsSectionBlocks.module.css'

type CmsFallbackHeroProps = {
  page: PageDetailResponse
}

<<<<<<< HEAD
export function CmsFallbackHero({ page }: CmsFallbackHeroProps) {
  const imageUrl = resolveCmsAssetUrl(page.hero_image_fetch_url)
=======
export function CmsFallbackHero({ page, header = null }: CmsFallbackHeroProps) {
  const imageUrl = resolvePageHeroImageUrl(page)
  const headerSubText = header?.sub_header_text?.trim() ?? ''
  const headerDescription = header?.description?.trim() ?? ''
  const description = headerDescription || headerSubText
  const eyebrow = headerDescription ? headerSubText : ''

  useEffect(() => {
    if (page.seo_page_description) {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', page.seo_page_description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = page.seo_page_description
        document.head.appendChild(meta)
      }
    }
  }, [page.seo_page_description])
>>>>>>> 7c0fbf18d0265774dcd451f52c7f4852d611d0ee

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
