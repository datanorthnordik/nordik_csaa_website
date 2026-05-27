import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GalleryDetailResponse } from '../../api/galleriesApi'
import { galleriesApi } from '../../api/galleriesApi'
import type { PageSection } from '../../api/pagesApi'
import {
  buildCmsGalleryAssets,
  normalizeGalleryViewMode,
} from './cmsGalleryMedia'
import { CmsGalleryCarousel } from './CmsGalleryCarousel'
import { CmsGalleryFocus } from './CmsGalleryFocus'
import { CmsGalleryGrid } from './CmsGalleryGrid'
import { CmsGalleryIcons } from './CmsGalleryIcons'
import { CmsGalleryLightbox } from './CmsGalleryLightbox'
import { CmsGalleryMasonry } from './CmsGalleryMasonry'
import styles from './CmsGallerySection.module.css'

type CmsGallerySectionProps = {
  section: PageSection
}

type GalleryStatus = 'loading' | 'ready' | 'error'

export function CmsGallerySection({ section }: CmsGallerySectionProps) {
  const { t } = useTranslation()
  const galleryId = section.gallery?.gallery_id ?? null
  const viewMode = normalizeGalleryViewMode(section.gallery?.view_mode)
  const showTitleDescription = section.gallery?.show_title_description ?? true
  const autoScrollEnabled = section.gallery?.auto_scroll_enabled ?? false
  const [gallery, setGallery] = useState<GalleryDetailResponse | null>(null)
  const [status, setStatus] = useState<GalleryStatus>('loading')
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!galleryId) {
      setGallery(null)
      setStatus('error')
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
  }, [galleryId])

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
    <section className={styles.gallerySection}>
      {status === 'loading' ? (
        <div className={styles.galleryLoading} aria-busy="true">
          <div className={styles.loadingPulse} aria-hidden="true" />
          <div className={styles.loadingBars}>
            <div className={styles.loadingBar} />
            <div className={`${styles.loadingBar} ${styles.loadingBarShort}`} />
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

          {viewMode !== 'icons' ? (
            <CmsGalleryLightbox
              items={items}
              showTitleDescription={showTitleDescription}
              activeIndex={activeLightboxIndex}
              onClose={() => setActiveLightboxIndex(null)}
              onSelect={setActiveLightboxIndex}
            />
          ) : null}
        </>
      ) : null}
    </section>
  )
}
