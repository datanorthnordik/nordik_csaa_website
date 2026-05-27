import { useEffect } from 'react'
import type { PageDetailResponse, PageHeaderSection } from '../../api/pagesApi'
import { SharedImageHero } from '../SharedImageHero'
import { resolvePageHeroImageUrl } from './cmsPageMedia'

type CmsFallbackHeroProps = {
  page: PageDetailResponse
  header?: PageHeaderSection | null
}

export function CmsFallbackHero({ page, header = null }: CmsFallbackHeroProps) {
  const imageUrl = resolvePageHeroImageUrl(page)
  const headerSubText = header?.sub_header_text?.trim() ?? ''
  const headerDescription = header?.description?.trim() ?? ''
  const pageDescription = page.seo_page_description.trim()
  const parentPageTitle = (page.parent_page_title ?? '').trim()
  const description = pageDescription || headerDescription || headerSubText
  const eyebrow =
    description === headerSubText
      ? parentPageTitle
      : headerSubText || parentPageTitle

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
    <SharedImageHero
      eyebrow={eyebrow}
      title={page.page_title.trim()}
      description={description}
      backgroundImageUrl={imageUrl}
      testId="cms-fallback-hero"
    />
  )
}
