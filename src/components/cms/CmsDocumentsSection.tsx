import type { PageDocument, PageSection } from '../../api/pagesApi'
import { getDocumentBadge, resolveCmsAssetUrl } from './cmsPageMedia'
import styles from './CmsSectionBlocks.module.css'

type CmsDocumentsSectionProps = {
  section: PageSection
}

export function CmsDocumentsSection({ section }: CmsDocumentsSectionProps) {
  const documents = section.documents?.items ?? []

  return (
    <section className={`${styles.section} ${styles.documentsSection}`}>
      <div className={styles.documentsGrid}>
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </section>
  )
}

function DocumentCard({ document }: { document: PageDocument }) {
  const href =
    resolveCmsAssetUrl(document.fetch_url) ?? resolveCmsAssetUrl(document.file_url)

  if (!href) {
    return null
  }

  return (
    <a
      className={styles.documentCard}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className={styles.documentBadge}>{getDocumentBadge(document)}</span>
      <div className={styles.documentBody}>
        <strong>{document.display_name || document.file_name}</strong>
        <p>{document.description || document.original_file_name || document.file_name}</p>
      </div>
    </a>
  )
}
