import type { PageSection } from '../../api/pagesApi'
import { QuoteBanner } from '../QuoteBanner'

type CmsQuoteSectionProps = {
  section: PageSection
}

export function CmsQuoteSection({ section }: CmsQuoteSectionProps) {
  const quote = section.quote
  if (!quote?.quote_content.trim()) {
    return null
  }

  return <QuoteBanner quote={quote.quote_content} attribution={quote.attribution} />
}
