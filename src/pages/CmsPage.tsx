import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  pagesApi,
  type PageDetailResponse,
  type PageSection,
} from '../api/pagesApi'
import { CmsFallbackHero } from '../components/cms/CmsFallbackHero'
import {
  resolveCmsAssetUrl,
  resolvePageHeroImageUrl,
} from '../components/cms/cmsPageMedia'
import { CmsSectionRenderer } from '../components/cms/CmsSectionRenderer'
import { formatPathLabel, normalizeInternalPath } from '../lib/navigationMenu'
import { buildAbsoluteUrl, SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import { ComingSoonPage } from './ComingSoonPage'
import styles from './CmsPage.module.css'

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error'

export function CmsPage() {
  const { pathname } = useLocation()
  const { i18n, t } = useTranslation()
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

  const sections = page?.page_detail?.sections ?? []
  const renderableSections = filterRenderableSections(sections)
  const firstHeaderSection =
    renderableSections.find(
      (section) => section.section_type === 'header' && section.header,
    ) ?? null
  const heroHeaderSection =
    renderableSections.find(
      (section) =>
        section.section_type === 'header' && section.header?.hierarchy === 'h1_hero',
    ) ?? null
  const locale = i18n.resolvedLanguage ?? i18n.language
  const activePage = status === 'ready' && page ? page : null
  const heroImageUrl = activePage ? resolvePageHeroImageUrl(activePage) : null
  const seoDescription = activePage
    ? buildCmsSeoDescription(activePage, renderableSections)
    : undefined
  const seoTitle = activePage
    ? buildCmsSeoTitle(activePage)
    : `${formatPathLabel(pathname)} | ${SITE_NAME}`
  const structuredData =
    activePage && seoDescription
      ? buildCmsPageStructuredData(activePage, seoDescription, heroImageUrl)
      : undefined

  usePageSeo({
    title: seoTitle,
    description: seoDescription,
    canonicalPath: activePage?.url_slug,
    image: heroImageUrl ?? undefined,
    lang: locale,
    noIndex: status === 'not-found' || status === 'error',
    jsonLd: structuredData,
  })

  if (status === 'loading') {
    return <CmsPageSkeleton loadingLabel={t('common.loading')} />
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

function filterRenderableSections(sections: PageSection[]) {
  return sections
    .filter((section) => section.is_enabled)
    .sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
    .filter((section) =>
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
}

function buildCmsSeoTitle(page: PageDetailResponse) {
  const baseTitle = normalizeSeoText(page.seo_page_title) || normalizeSeoText(page.page_title)
  if (!baseTitle) {
    return SITE_NAME
  }

  return baseTitle.includes(SITE_NAME) ? baseTitle : `${baseTitle} | ${SITE_NAME}`
}

function buildCmsSeoDescription(
  page: PageDetailResponse,
  sections: PageSection[],
) {
  const firstTypographySection = sections.find(
    (section) => section.section_type === 'typography' && section.typography,
  )
  const firstQuoteSection = sections.find(
    (section) => section.section_type === 'quote' && section.quote,
  )
  const firstHeaderSection = sections.find(
    (section) => section.section_type === 'header' && section.header,
  )

  return (
    normalizeSeoText(page.seo_page_description) ||
    normalizeSeoText(firstHeaderSection?.header?.description) ||
    normalizeSeoText(firstHeaderSection?.header?.sub_header_text) ||
    normalizeSeoText(firstTypographySection?.typography?.html_content) ||
    normalizeSeoText(firstTypographySection?.typography?.text_content) ||
    normalizeSeoText(firstQuoteSection?.quote?.quote_content) ||
    normalizeSeoText(page.page_title)
  )
}

function buildCmsPageStructuredData(
  page: PageDetailResponse,
  description: string,
  imageUrl?: string | null,
) {
  const pageTitle = normalizeSeoText(page.page_title)
  const pageUrl = normalizeSeoText(page.url_slug)
  if (!pageTitle || !pageUrl) {
    return undefined
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description,
    url: buildAbsoluteUrl(pageUrl),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: buildAbsoluteUrl('/'),
    },
    primaryImageOfPage: imageUrl || undefined,
    about: normalizeSeoText(page.parent_page_title)
      ? {
          '@type': 'Thing',
          name: normalizeSeoText(page.parent_page_title),
        }
      : undefined,
  }
}

function normalizeSeoText(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveLoadStatus(page: PageDetailResponse | null): LoadStatus {
  if (!page) {
    return 'loading'
  }

  return page.page_type === 'module' ? 'not-found' : 'ready'
}

function CmsPageSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div className={styles.loadingPage} aria-busy="true">
      <div className={styles.visuallyHidden}>{loadingLabel}</div>

      <section className={styles.loadingHero} aria-hidden="true">
        <div className={styles.loadingHeroImage} />
        <div className={styles.loadingHeroOverlay} />
        <div className={styles.loadingHeroContent}>
          <span className={`${styles.loadingBar} ${styles.loadingEyebrow}`} />
          <span className={`${styles.loadingBar} ${styles.loadingTitle}`} />
          <span className={`${styles.loadingBar} ${styles.loadingTitleShort}`} />
          <span className={`${styles.loadingBar} ${styles.loadingBody}`} />
          <span className={`${styles.loadingBar} ${styles.loadingBodyWide}`} />
        </div>
      </section>

      <div className={styles.loadingSections}>
        <section className={styles.loadingSection} aria-hidden="true">
          <div className={styles.loadingCard}>
            <span className={`${styles.loadingBar} ${styles.loadingSectionTitle}`} />
            <span className={`${styles.loadingBar} ${styles.loadingSectionBody}`} />
            <span className={`${styles.loadingBar} ${styles.loadingSectionBodyWide}`} />
          </div>
        </section>

        <section className={styles.loadingSection} aria-hidden="true">
          <div className={styles.loadingGalleryGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.loadingGalleryTile} />
            ))}
          </div>
        </section>

        <section className={styles.loadingSection} aria-hidden="true">
          <div className={styles.loadingCard}>
            <span className={`${styles.loadingBar} ${styles.loadingQuote}`} />
            <span className={`${styles.loadingBar} ${styles.loadingQuoteShort}`} />
          </div>
        </section>
      </div>
    </div>
  )
}
