import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './CommunityCirclePage.module.css'

export function CommunityGalleryPage() {
  usePageBreadcrumbs([
    { label: 'Community Circle', href: '/community-circle' },
    { label: 'Photo Gallery' },
  ])

  usePageSeo({
    title: `Community Photo Gallery | ${SITE_NAME}`,
    description:
      "Faces, places, and moments from our community's history — browse the Shingwauk photo archive together.",
    canonicalPath: '/community-circle/gallery',
    image: WEBSITE_ASSET_URLS.gatheringsHeroStage,
  })

  return (
    <div className={styles.page}>
      <SharedImageHero
        eyebrow="Community Circle"
        title="Community Photo Gallery"
        description="Faces, places, and moments from our community's history."
        backgroundImageUrl={WEBSITE_ASSET_URLS.gatheringsHeroStage}
        backgroundPosition="center center"
      />
      <section className={styles.explore}>
        <div className={styles.exploreHead}>
          <p className={styles.eyebrow}>Coming Soon</p>
          <h2 className={styles.exploreTitle}>A living photo archive</h2>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.exploreLead}>
            This gallery will connect to our photo archive and present images in a
            full-screen, continuously scrolling view to browse and remember together.
          </p>
        </div>
      </section>
    </div>
  )
}
