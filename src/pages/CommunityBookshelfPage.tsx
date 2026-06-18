import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import styles from './CommunityCirclePage.module.css'

export function CommunityBookshelfPage() {
  usePageBreadcrumbs([
    { label: 'Community Circle', href: '/community-circle' },
    { label: 'The Bookshelf' },
  ])

  return (
    <div className={styles.page}>
      <SharedImageHero
        eyebrow="Community Circle"
        title="The Bookshelf"
        description="Featured books and writings that carry our history forward."
        backgroundImageUrl={WEBSITE_ASSET_URLS.gatheringsHeroStage}
        backgroundPosition="center center"
      />
      <section className={styles.explore}>
        <div className={styles.exploreHead}>
          <p className={styles.eyebrow}>Coming Soon</p>
          <h2 className={styles.exploreTitle}>Featured reads</h2>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.exploreLead}>
            A curated shelf of books and writings will live here for the community
            to explore.
          </p>
        </div>
      </section>
    </div>
  )
}
