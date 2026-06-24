import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './CommunityCirclePage.module.css'

export function CommunityCookbookPage() {
  usePageBreadcrumbs([
    { label: 'Community Circle', href: '/community-circle' },
    { label: 'Community Cookbook' },
  ])

  usePageSeo({
    title: `Community Cookbook | ${SITE_NAME}`,
    description:
      'Recipes shared by our community — and a place to add your own family recipe to the community cookbook.',
    canonicalPath: '/community-circle/cookbook',
    image: WEBSITE_ASSET_URLS.gatheringsHeroStage,
  })

  return (
    <div className={styles.page}>
      <SharedImageHero
        eyebrow="Community Circle"
        title="The Community Cookbook"
        description="Recipes shared by our community — and a place to add your own."
        backgroundImageUrl={WEBSITE_ASSET_URLS.gatheringsHeroStage}
        backgroundPosition="center center"
      />
      <section className={styles.explore}>
        <div className={styles.exploreHead}>
          <p className={styles.eyebrow}>Coming Soon</p>
          <h2 className={styles.exploreTitle}>Share a recipe</h2>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.exploreLead}>
            Soon you'll be able to submit a family recipe here and see it added to
            our growing community cookbook.
          </p>
        </div>
      </section>
    </div>
  )
}
