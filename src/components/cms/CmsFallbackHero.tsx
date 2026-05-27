import { useEffect } from 'react'
import type { PageDetailResponse } from '../../api/pagesApi'
import { CmsHeroMedia } from './CmsHeroMedia'
import { resolvePageHeroImageUrl } from './cmsPageMedia'
import styles from './CmsSectionBlocks.module.css'

type CmsFallbackHeroProps = {
  page: PageDetailResponse
}

export function CmsFallbackHero({ page }: CmsFallbackHeroProps) {
  const imageUrl = resolvePageHeroImageUrl(page)

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

  return (
    <section className={`${styles.section} ${styles.heroSection}`}>
      <div className={styles.heroCard}>
        <CmsHeroMedia imageUrl={imageUrl} title={page.page_title} />
      </div>
    </section>
  )
}
