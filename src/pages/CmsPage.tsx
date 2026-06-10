import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  pagesApi,
  type PageDetailResponse,
} from '../api/pagesApi'
import { CmsFallbackHero } from '../components/cms/CmsFallbackHero'
import {
  resolveCmsAssetUrl,
  resolvePageHeroImageUrl,
} from '../components/cms/cmsPageMedia'
import { CmsSectionRenderer } from '../components/cms/CmsSectionRenderer'
import { formatPathLabel, normalizeInternalPath } from '../lib/navigationMenu'
import { ComingSoonPage } from './ComingSoonPage'
import styles from './CmsPage.module.css'

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error'

export function CmsPage() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const normalizedPath = normalizeInternalPath(pathname)
  const [page, setPage] = useState<PageDetailResponse | null>(() =>
    pagesApi.peekPageBySlug(normalizedPath),
  )
  const [status, setStatus] = useState<LoadStatus>(() =>
    resolveLoadStatus(pagesApi.peekPageBySlug(normalizedPath)),
  )

  useEffect(() => {
    let ignore = false
    const cachedPage = pagesApi.peekPageBySlug(normalizedPath)

    setPage(cachedPage)
    setStatus(resolveLoadStatus(cachedPage))

    if (cachedPage) {
      return () => {
        ignore = true
      }
    }

    async function loadPage() {
      setStatus('loading')

      try {
        const response = await pagesApi.getPageBySlug(normalizedPath)

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
  }, [normalizedPath])

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
      : section.section_type === 'document'
        ? Boolean(
            section.documents?.items?.some((document) =>
              Boolean(
                resolveCmsAssetUrl(document.fetch_url) ??
                  resolveCmsAssetUrl(document.file_url),
              ),
            ),
          )
      : section.section_type === 'gallery'
        ? Boolean(section.gallery?.gallery_id)
      : section.section_type === 'quote'
        ? Boolean(section.quote?.quote_content.trim())
        : section.section_type === 'cta_banner'
          ? Boolean(section.cta_banner)
          : false,
  )
  const firstHeaderSection =
    renderableSections.find(
      (section) => section.section_type === 'header' && section.header,
    ) ?? null
  const heroHeaderSection =
    renderableSections.find(
      (section) =>
        section.section_type === 'header' && section.header?.hierarchy === 'h1_hero',
    ) ?? null
  const hasPageHeroImage = Boolean(resolvePageHeroImageUrl(page))
  const showFallbackHero = !heroHeaderSection && (!firstHeaderSection || hasPageHeroImage)
  const visibleSections = heroHeaderSection
    ? renderableSections.filter((section) => section.id !== heroHeaderSection.id)
    : renderableSections

  return (
    <div className={styles.page}>
      {heroHeaderSection ? (
        <CmsSectionRenderer
          page={page}
          section={heroHeaderSection}
          isPrimaryHeader
        />
      ) : null}
      {showFallbackHero ? (
        <CmsFallbackHero page={page} header={firstHeaderSection?.header ?? null} />
      ) : null}

      <div className={styles.sections}>
        {visibleSections.map((section) => (
          <CmsSectionRenderer
            key={section.id}
            page={page}
            section={section}
            isPrimaryHeader={false}
          />
        ))}
      </div>
    </div>
  )
}

function resolveLoadStatus(page: PageDetailResponse | null): LoadStatus {
  if (!page) {
    return 'loading'
  }

  return page.page_type === 'module' ? 'not-found' : 'ready'
}
