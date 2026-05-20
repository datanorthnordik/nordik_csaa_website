import type { PageDetailResponse, PageSection } from '../../api/pagesApi'
import { CmsCtaSection } from './CmsCtaSection'
import { CmsDocumentsSection } from './CmsDocumentsSection'
import { CmsGallerySection } from './CmsGallerySection'
import { CmsHeaderSection } from './CmsHeaderSection'
import { CmsQuoteSection } from './CmsQuoteSection'
import { CmsTypographySection } from './CmsTypographySection'

type CmsSectionRendererProps = {
  page: PageDetailResponse
  section: PageSection
  isPrimaryHeader: boolean
}

export function CmsSectionRenderer({
  page,
  section,
  isPrimaryHeader,
}: CmsSectionRendererProps) {
  switch (section.section_type) {
    case 'header':
      return section.header ? (
        <CmsHeaderSection
          page={page}
          section={section}
          isPrimaryHeader={isPrimaryHeader}
        />
      ) : null
    case 'typography':
      return section.typography ? <CmsTypographySection section={section} /> : null
    case 'document':
      return section.documents?.items?.length ? <CmsDocumentsSection section={section} /> : null
    case 'gallery':
      return section.gallery?.gallery_id ? <CmsGallerySection section={section} /> : null
    case 'quote':
      return section.quote ? <CmsQuoteSection section={section} /> : null
    case 'cta_banner':
      return section.cta_banner ? <CmsCtaSection section={section} /> : null
    default:
      return null
  }
}
