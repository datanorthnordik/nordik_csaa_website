import { Link } from 'react-router-dom'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SharedImageHero } from '../components/SharedImageHero'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import styles from './CommunityCirclePage.module.css'

type CircleCard = {
  icon: string
  title: string
  desc: string
  href: string
  openInNewTab?: boolean
}

const CARDS: CircleCard[] = [
  {
    icon: '🍲',
    title: 'Community Cookbook',
    desc: 'Share a family recipe and add it to our growing community cookbook.',
    href: '/community-circle/cookbook',
  },
  {
    icon: '🖼️',
    title: 'Photo Gallery',
    desc: 'Browse our community photo archive — spot the faces, places, and moments you remember.',
    href: '/community-circle/gallery',
    openInNewTab: true,
  },
  {
    icon: '📖',
    title: 'Knowledge Sharing',
    desc: 'Explore stories, videos, and living history shared by Survivors and Elders.',
    href: '/living-history-hub',
  },
  {
    icon: '📚',
    title: 'The Bookshelf',
    desc: 'Read featured books and writings that carry our history forward.',
    href: '/community-circle/bookshelf',
  },
]

export function CommunityCirclePage() {
  usePageBreadcrumbs([{ label: 'Community Circle' }])

  return (
    <div className={styles.page}>
      <SharedImageHero
        eyebrow="Community Circle"
        title="Our Community Interactive Space"
        description="A place to gather, share, and connect — where the community comes together to tell its own story."
        backgroundImageUrl={WEBSITE_ASSET_URLS.gatheringsHeroStage}
        backgroundPosition="center center"
      />

      <section className={styles.explore}>
        <div className={styles.exploreHead}>
          <p className={styles.eyebrow}>Explore the Circle</p>
          <h2 className={styles.exploreTitle}>Ways to gather and share</h2>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.exploreLead}>
            Whether you want to share a recipe, look through old photos, listen to
            a story, or pick up a good book — there's a place for you here. Choose
            where you'd like to begin.
          </p>
        </div>

        <div className={styles.cardGrid}>
          {CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.href}
              className={styles.card}
              target={card.openInNewTab ? '_blank' : undefined}
              rel={card.openInNewTab ? 'noopener noreferrer' : undefined}
            >
              <span className={styles.cardIcon} aria-hidden="true">{card.icon}</span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
              <span className={styles.cardLink}>Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
