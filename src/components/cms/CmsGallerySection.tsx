import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GalleryDetailResponse } from '../../api/galleriesApi'
import { galleriesApi } from '../../api/galleriesApi'
import type { PageSection } from '../../api/pagesApi'
import { normalizeCmsLabel, resolveCmsAssetUrl } from './cmsPageMedia'
import {
  buildCmsGalleryAssets,
  normalizeGalleryViewMode,
} from './cmsGalleryMedia'
import { CmsGalleryCarousel } from './CmsGalleryCarousel'
import { CmsGalleryFocus } from './CmsGalleryFocus'
import { CmsGalleryGrid } from './CmsGalleryGrid'
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
  const title = gallery?.name.trim() || section.section_name
  const description = gallery?.description.trim() || ''
  const eyebrow =
    normalizeCmsLabel(section.section_name) !== normalizeCmsLabel(title)
      ? section.section_name
      : t('cmsGallery.label')
  const coverImageUrl = gallery?.cover_image
    ? resolveCmsAssetUrl(gallery.cover_image.file_url || gallery.cover_image.storage_uri)
    : null
  const introStyle = coverImageUrl
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(8, 8, 10, 0.2), rgba(8, 8, 10, 0.05)), url(${coverImageUrl})`,
      }
    : undefined

  return (
    <section className={styles.gallerySection}>
      <div
        className={`${styles.galleryIntro} ${
          coverImageUrl ? styles.galleryIntroWithCover : ''
        }`}
        style={introStyle}
      >
        <div className={styles.galleryIntroContent}>
          <p className={styles.galleryEyebrow}>{eyebrow}</p>
          <h2 className={styles.galleryTitle}>{title}</h2>
          {description ? <p className={styles.galleryDescription}>{description}</p> : null}
          {status === 'ready' && items.length ? (
            <div className={styles.galleryMeta}>
              <p className={styles.galleryCount}>
                {t('cmsGallery.imagesCount', { count: items.length })}
              </p>
            </div>
          ) : null}
        </div>
      </div>

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

      {status === 'ready' && !items.length ? (
        <div className={styles.galleryState}>
          <p className={styles.galleryStateText}>{t('cmsGallery.empty')}</p>
        </div>
      ) : null}

      {status === 'ready' && items.length ? (
        <>
          {viewMode === 'masonry' ? (
            <CmsGalleryMasonry items={items} onOpen={setActiveLightboxIndex} />
          ) : null}
          {viewMode === 'focus' ? (
            <CmsGalleryFocus items={items} onOpen={setActiveLightboxIndex} />
          ) : null}
          {viewMode === 'carousel' ? (
            <CmsGalleryCarousel items={items} onOpen={setActiveLightboxIndex} />
          ) : null}
          {viewMode === 'grid' ? (
            <CmsGalleryGrid items={items} onOpen={setActiveLightboxIndex} />
          ) : null}

          <CmsGalleryLightbox
            items={items}
            activeIndex={activeLightboxIndex}
            onClose={() => setActiveLightboxIndex(null)}
            onSelect={setActiveLightboxIndex}
          />
        </>
      ) : null}
    </section>
  )
}
