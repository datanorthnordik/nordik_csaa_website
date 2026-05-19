import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  pagesApi,
  type PageDetailResponse,
} from '../api/pagesApi'
import { CmsFallbackHero } from '../components/cms/CmsFallbackHero'
import { CmsSectionRenderer } from '../components/cms/CmsSectionRenderer'
import { formatPathLabel, normalizeInternalPath } from '../lib/navigationMenu'
import { ComingSoonPage } from './ComingSoonPage'
import styles from './CmsPage.module.css'

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error'

export function CmsPage() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [page, setPage] = useState<PageDetailResponse | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    let ignore = false

    async function loadPage() {
      setStatus('loading')

      try {
        const response = await pagesApi.getPageBySlug(normalizeInternalPath(pathname))

        if (!ignore) {
          setPage(response)
          setStatus(response.page_type === 'module' ? 'not-found' : 'ready')
        }
      } catch (error) {
        if (ignore) {
          return
        }

        setPage(null)
        if (isAxiosError(error) && error.response?.status === 404) {
          setStatus('not-found')
          return
        }

        setStatus('error')
      }
    }

    void loadPage()

    return () => {
      ignore = true
    }
  }, [pathname])

  if (status === 'loading') {
    return (
      <div className={styles.loadingState} aria-busy="true">
        <div className={styles.loadingPulse} aria-hidden="true" />
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.errorState}>
        <h1>{formatPathLabel(pathname)}</h1>
        <p>{t('cmsPage.loadError')}</p>
      </div>
    )
  }

  if (status === 'not-found' || !page) {
    return <ComingSoonPage />
  }

  const sections = (page.page_detail?.sections ?? [])
    .filter((section) => section.is_enabled)
    .sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
  const renderableSections = sections.filter((section) =>
    section.section_type === 'header'
      ? Boolean(section.header)
      : section.section_type === 'typography'
        ? Boolean(
            section.typography &&
              (section.typography.html_content.trim() ||
                section.typography.text_content.trim()),
          )
      : section.section_type === 'gallery'
        ? Boolean(section.gallery?.gallery_id)
      : section.section_type === 'quote'
        ? Boolean(section.quote?.quote_content.trim())
        : section.section_type === 'cta_banner'
          ? Boolean(section.cta_banner)
          : false,
  )
  const firstHeaderId =
    renderableSections.find(
      (section) => section.section_type === 'header' && section.header,
    )?.id ?? null

  return (
    <div className={styles.page}>
      {renderableSections.length === 0 ? <CmsFallbackHero page={page} /> : null}

      <div className={styles.sections}>
        {renderableSections.map((section) => (
          <CmsSectionRenderer
            key={section.id}
            page={page}
            section={section}
            isPrimaryHeader={section.id === firstHeaderId}
          />
        ))}
      </div>
    </div>
  )
}
