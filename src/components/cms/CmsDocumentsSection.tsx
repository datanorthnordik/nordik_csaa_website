import { useTranslation } from 'react-i18next'
import type { PageSection } from '../../api/pagesApi'
import { DocumentShowcase } from '../documents/DocumentShowcase'
import { downloadPublicFile } from '../../lib/fileDownload'
import { getDocumentBadge, resolveCmsAssetUrl } from './cmsPageMedia'

type CmsDocumentsSectionProps = {
  section: PageSection
}

export function CmsDocumentsSection({ section }: CmsDocumentsSectionProps) {
  const { t } = useTranslation()
  const items = (section.documents?.items ?? [])
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
    .flatMap((document) => {
      const resolvedUrl =
        resolveCmsAssetUrl(document.fetch_url) ?? resolveCmsAssetUrl(document.file_url)

      if (!resolvedUrl) {
        return []
      }

      return [
        {
          id: document.id,
          title: document.display_name.trim() || document.file_name,
          description:
            document.description.trim() ||
            document.original_file_name.trim() ||
            document.file_name,
          previewUrl: resolvedUrl,
          downloadUrl: resolvedUrl,
          downloadFileName:
            document.original_file_name.trim() ||
            document.file_name.trim() ||
            document.display_name.trim() ||
            'document',
          badgeLabel: getDocumentBadge(document),
          mimeType: document.mime_type,
        },
      ]
    })

  if (!items.length) {
    return null
  }

  return (
    <DocumentShowcase
      heading={t('eventDetail.documentsTitle')}
      items={items}
      getSummary={(item) => ({
        title: item.title,
        description: item.description,
      })}
      getDownloadLabel={(item) =>
        item.mimeType.toLowerCase() === 'application/pdf'
          ? t('eventDetail.agendaDownloadPdfAction')
          : t('eventDetail.agendaDownloadFileAction')
      }
      onDownload={(item) => downloadPublicFile(item.downloadUrl, item.downloadFileName)}
      downloadErrorText={t('eventDetail.agendaDownloadError')}
    />
  )
}
