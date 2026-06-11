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
  const description = headerDescription || headerSubText
  const eyebrow = headerDescription ? headerSubText : ''

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
