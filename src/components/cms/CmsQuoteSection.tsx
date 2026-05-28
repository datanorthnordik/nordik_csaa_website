import type { PageSection } from '../../api/pagesApi'
import styles from './CmsSectionBlocks.module.css'

type CmsQuoteSectionProps = {
  section: PageSection
}

export function CmsQuoteSection({ section }: CmsQuoteSectionProps) {
  const quote = section.quote
  if (!quote?.quote_content.trim()) {
    return null
  }

  return (
    <section className={`${styles.section} ${styles.quoteSection}`}>
      <blockquote className={styles.quoteCard}>
        <span className={styles.quoteMark} aria-hidden="true">
          "
        </span>
        <p className={styles.quoteText}>{quote.quote_content}</p>
        {quote.attribution ? (
          <footer className={styles.quoteAttribution}>{quote.attribution}</footer>
        ) : null}
      </blockquote>
    </section>
  )
}
