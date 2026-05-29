import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  publicResourcesApi,
  type PublicResourceCategory,
  type PublicResourceEntry,
  type PublicResourceListPageMeta,
  resolvePublicResourceContentUrl,
} from '../api/resourcesApi'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { DocumentViewerModal } from '../components/documents/DocumentViewerModal'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import { downloadPublicFile } from '../lib/fileDownload'
import styles from './ResourcesPage.module.css'

const PAGE_SIZE = 10

const defaultPagination: PublicResourceListPageMeta = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
}

export function CommunityResourcesPage() {
  const { t } = useTranslation()
  const [resources, setResources] = useState<PublicResourceEntry[]>([])
  const [pagination, setPagination] = useState<PublicResourceListPageMeta>(defaultPagination)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<PublicResourceEntry | null>(null)

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  usePageBreadcrumbs([
    {
      label: t('site.breadcrumbs.communitySupportTeam'),
      href: '/community-support-team',
    },
    {
      label: t('site.breadcrumbs.resourcesSupport'),
    },
  ])

  usePageMeta({
    title: 'Resources & Support | Children of Shingwauk Alumni Association',
    description:
      'Browse educational resources, media, reports, and support links from the Children of Shingwauk Alumni Association Community Support Team.',
  })

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [normalizedSearchTerm])

  useEffect(() => {
    let ignore = false

    async function loadResources() {
      setError(null)
      setIsLoading(page === 1)
      setIsLoadingMore(page > 1)

      try {
        const response = await publicResourcesApi.listResources({
          page,
          pageSize: PAGE_SIZE,
          searchTerm: normalizedSearchTerm,
        })

        if (!ignore) {
          setResources((current) =>
            page === 1 ? response.items : mergeResources(current, response.items),
          )
          setPagination(response.pagination)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(getErrorMessage(loadError))
          if (page === 1) {
            setResources([])
            setPagination(defaultPagination)
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    }

    void loadResources()

    return () => {
      ignore = true
    }
  }, [normalizedSearchTerm, page])

  const visibleResources = useMemo(() => resources, [resources])

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="resources-page-title">
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Community Support Team</p>
          <h1 id="resources-page-title" className={styles.heroTitle}>
            Resources &amp; Support
          </h1>
          <p className={styles.heroDescription}>
            Tools, guides, and materials to support our community through their journey.
            Find the help you need, when you need it most.
          </p>

          <label className={styles.searchBox}>
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon />
            </span>
            <span className={styles.visuallyHidden}>Search resources</span>
            <input
              type="search"
              value={searchTerm}
              placeholder="What are you looking for?"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={styles.resourcesSection}>
        {error ? <p className={styles.errorText}>{error}</p> : null}

        {isLoading ? (
          <div className={styles.cardGrid} aria-label="Loading resources">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className={styles.skeletonCard} aria-hidden="true" />
            ))}
          </div>
        ) : visibleResources.length ? (
          <>
            <div className={styles.cardGrid}>
              {visibleResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpenDocument={setSelectedDocument}
                />
              ))}
            </div>

            {pagination.hasNext ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreButton}
                  disabled={isLoadingMore}
                  onClick={() => setPage((current) => current + 1)}
                >
                  {isLoadingMore ? 'Loading...' : 'Show more'}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>No resources found</h3>
            <p>Try changing your search term or check back later for new resources.</p>
          </div>
        )}
      </section>

      <section className={styles.supportSection} aria-labelledby="community-support-title">
        <div className={styles.supportMedia}>
          <img
            src={WEBSITE_ASSET_URLS.communitySupportTeamLogo}
            alt="Community Support Team logo"
            className={styles.supportLogo}
            loading="lazy"
          />
        </div>
        <div className={styles.supportCopy}>
          <p className={styles.sectionEyebrow}>Community Support Team</p>
          <h2 id="community-support-title">We are here for the Community</h2>
          <p>
            Our mission is rooted in honouring survivors, their families, affected
            communities, and those who never made it home.
          </p>
          <a href="/community-support-team" className={styles.primaryAction}>
            Learn More
          </a>
        </div>
      </section>

      {selectedDocument ? (
        <DocumentViewerModal
          title={selectedDocument.name}
          previewUrl={resolvePublicResourceContentUrl({
            id: selectedDocument.id,
            contentUrl: selectedDocument.contentUrl,
          })}
          mimeType={selectedDocument.mimeType}
          onClose={() => setSelectedDocument(null)}
          controls={
            <button
              type="button"
              onClick={() =>
                downloadPublicFile(
                  resolvePublicResourceContentUrl({
                    id: selectedDocument.id,
                    contentUrl: selectedDocument.contentUrl,
                  }),
                  getResourceFileName(selectedDocument),
                )
              }
            >
              Download document
            </button>
          }
        />
      ) : null}
    </main>
  )
}

type ResourceCardProps = {
  resource: PublicResourceEntry
  onOpenDocument: (resource: PublicResourceEntry) => void
}

function ResourceCard({ resource, onOpenDocument }: ResourceCardProps) {
  const isLinkResource = resource.category === 'link'
  const actionLabel = getResourceActionLabel(resource)

  return (
    <article className={styles.card}>
      <div className={`${styles.categoryIcon} ${styles[getCategoryToneClass(resource.category)]}`}>
        <ResourceCategoryIcon category={resource.category} />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.categoryLabel}>{resource.categoryLabel}</p>
        <h3 className={styles.cardTitle}>{resource.name}</h3>
        <p className={styles.cardDescription}>{resource.description}</p>
      </div>

      {isLinkResource ? (
        <a
          href={resource.linkUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.cardAction}
          aria-label={`${actionLabel}: ${resource.name}`}
        >
          {actionLabel}
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        <button
          type="button"
          className={styles.cardActionButton}
          onClick={() => onOpenDocument(resource)}
          aria-label={`${actionLabel}: ${resource.name}`}
        >
          {actionLabel}
          <span aria-hidden="true">→</span>
        </button>
      )}
    </article>
  )
}

function usePageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content

    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description

    return () => {
      document.title = previousTitle
      if (meta) {
        meta.content = previousDescription ?? ''
      }
    }
  }, [description, title])
}

function mergeResources(
  current: PublicResourceEntry[],
  next: PublicResourceEntry[],
) {
  const seen = new Set(current.map((item) => item.id))
  return [...current, ...next.filter((item) => !seen.has(item.id))]
}

function getResourceActionLabel(resource: PublicResourceEntry) {
  if (resource.category === 'link') {
    return 'Access Resource'
  }
  return 'Open Documents'
}

function getCategoryToneClass(category: PublicResourceCategory) {
  switch (category) {
    case 'educational':
      return 'iconEducational'
    case 'media':
      return 'iconMedia'
    case 'link':
      return 'iconLink'
    case 'report':
      return 'iconReport'
    default:
      return 'iconDefault'
  }
}

function getResourceFileName(resource: PublicResourceEntry) {
  const trimmedFileName = resource.fileName.trim()
  const trimmedResourceName = resource.name.trim()

  return trimmedFileName || trimmedResourceName || 'document'
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load resources.'
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.8 10.8 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ResourceCategoryIcon({ category }: { category: PublicResourceCategory }) {
  if (category === 'educational') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 7h8M8 11h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (category === 'media') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
      </svg>
    )
  }

  if (category === 'link') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.6 5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l.8-.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  return <DocumentIcon />
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20.5H7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 3.5v4h4M9.5 12h5M9.5 15.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
