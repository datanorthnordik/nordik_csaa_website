import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GalleryDetailResponse } from '../../api/galleriesApi'
import { galleriesApi } from '../../api/galleriesApi'
import type { PageSection } from '../../api/pagesApi'
import {
  buildCmsGalleryAssets,
  type CmsGalleryViewMode,
  normalizeGalleryViewMode,
} from './cmsGalleryMedia'
import { CmsGalleryCarousel } from './CmsGalleryCarousel'
import { CmsGalleryFocus } from './CmsGalleryFocus'
import { CmsGalleryGrid } from './CmsGalleryGrid'
import { CmsGalleryIcons } from './CmsGalleryIcons'
import { CmsGalleryMasonry } from './CmsGalleryMasonry'
import styles from './CmsGallerySection.module.css'

type CmsGallerySectionProps = {
  section: PageSection
}

type GalleryStatus = 'idle' | 'loading' | 'ready' | 'error'

const galleryLoadRootMargin = '120px 0px'

const CmsGalleryLightbox = lazy(() =>
  import('./CmsGalleryLightbox').then((module) => ({
    default: module.CmsGalleryLightbox,
  })),
)

function shouldLoadGalleryImmediately() {
  return typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined'
}

export function CmsGallerySection({ section }: CmsGallerySectionProps) {
  const { t } = useTranslation()
  const galleryId = section.gallery?.gallery_id ?? null
  const viewMode = normalizeGalleryViewMode(section.gallery?.view_mode)
  const showTitleDescription = section.gallery?.show_title_description ?? true
  const autoScrollEnabled = section.gallery?.auto_scroll_enabled ?? false
  const [gallery, setGallery] = useState<GalleryDetailResponse | null>(null)
  const [status, setStatus] = useState<GalleryStatus>(() =>
    shouldLoadGalleryImmediately() ? 'loading' : 'idle',
  )
  const [shouldLoadGallery, setShouldLoadGallery] = useState(() =>
    shouldLoadGalleryImmediately(),
  )
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const loadImmediately = shouldLoadGalleryImmediately()

    setGallery(null)
    setShouldLoadGallery(loadImmediately)
    setStatus(loadImmediately ? 'loading' : 'idle')
  }, [galleryId])

  useEffect(() => {
    if (!galleryId || shouldLoadGallery) {
      return
    }

    const sectionElement = sectionRef.current
    if (!sectionElement || typeof window.IntersectionObserver === 'undefined') {
      setShouldLoadGallery(true)
      return
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        setShouldLoadGallery(true)
        observer.disconnect()
      },
      {
        rootMargin: galleryLoadRootMargin,
        threshold: 0.01,
      },
    )

    observer.observe(sectionElement)

    return () => {
      observer.disconnect()
    }
  }, [galleryId, shouldLoadGallery])

  useEffect(() => {
    if (!galleryId) {
      setGallery(null)
      setStatus('error')
      return
    }

    if (!shouldLoadGallery) {
      return
    }

    const resolvedGalleryId = galleryId
    let ignore = false

    async function loadGallery() {
      setStatus('loading')

      try {
        const response = await galleriesApi.getGallery(resolvedGalleryId)
        if (!ignore) {
          setGallery(response)
          setStatus('ready')
        }
      } catch {
        if (!ignore) {
          setGallery(null)
          setStatus('error')
        }
      }
    }

    void loadGallery()

    return () => {
      ignore = true
    }
  }, [galleryId, shouldLoadGallery])

  useEffect(() => {
    setActiveLightboxIndex(null)
  }, [galleryId, viewMode])

  if (!galleryId) {
    return null
  }

  const items = gallery ? buildCmsGalleryAssets(gallery) : []

  if (status === 'ready' && !items.length) {
    return null
  }

  return (
    <section ref={sectionRef} className={styles.gallerySection}>
      {status === 'idle' || status === 'loading' ? (
        <div className={styles.galleryLoading} aria-busy="true">
          <div className={styles.galleryLoadingPreview} aria-hidden="true">
            {renderGalleryLoadingPreview(viewMode)}
          </div>
          <p className={styles.galleryStateText}>{t('cmsGallery.loading')}</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className={styles.galleryState}>
          <p className={styles.galleryStateText}>{t('cmsGallery.unavailable')}</p>
        </div>
      ) : null}

      {status === 'ready' && items.length ? (
        <>
          {viewMode === 'masonry' ? (
            <CmsGalleryMasonry
              items={items}
              showTitleDescription={showTitleDescription}
              onOpen={setActiveLightboxIndex}
            />
          ) : null}
          {viewMode === 'focus' ? (
            <CmsGalleryFocus
              items={items}
              showTitleDescription={showTitleDescription}
              onOpen={setActiveLightboxIndex}
            />
          ) : null}
          {viewMode === 'carousel' ? (
            <CmsGalleryCarousel
              items={items}
              showTitleDescription={showTitleDescription}
              autoScrollEnabled={autoScrollEnabled}
              onOpen={setActiveLightboxIndex}
            />
          ) : null}
          {viewMode === 'grid' ? (
            <CmsGalleryGrid
              items={items}
              showTitleDescription={showTitleDescription}
              onOpen={setActiveLightboxIndex}
            />
          ) : null}
          {viewMode === 'icons' ? <CmsGalleryIcons items={items} /> : null}

          {viewMode !== 'icons' && activeLightboxIndex !== null ? (
            <Suspense fallback={null}>
              <CmsGalleryLightbox
                items={items}
                showTitleDescription={showTitleDescription}
                activeIndex={activeLightboxIndex}
                onClose={() => setActiveLightboxIndex(null)}
                onSelect={setActiveLightboxIndex}
              />
            </Suspense>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

function renderGalleryLoadingPreview(viewMode: CmsGalleryViewMode) {
  if (viewMode === 'masonry') {
    return (
      <div className={styles.galleryLoadingMasonry}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.galleryLoadingMasonryItem} />
        ))}
      </div>
    )
  }

  if (viewMode === 'focus' || viewMode === 'carousel') {
    return (
      <div className={styles.galleryLoadingFeature}>
        <div className={styles.galleryLoadingStage} />
        <div className={styles.galleryLoadingRail}>
          {Array.from({ length: viewMode === 'carousel' ? 3 : 4 }).map((_, index) => (
            <div key={index} className={styles.galleryLoadingThumb} />
          ))}
        </div>
      </div>
    )
  }

  if (viewMode === 'icons') {
    return (
      <div className={styles.galleryLoadingIcons}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.galleryLoadingIconTile} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.galleryLoadingGrid}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={styles.galleryLoadingTile} />
      ))}
    </div>
  )
}
