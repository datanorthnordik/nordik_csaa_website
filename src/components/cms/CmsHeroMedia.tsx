import styles from './CmsSectionBlocks.module.css'

type CmsHeroMediaProps = {
  imageUrl: string | null
  title: string
  showFallback?: boolean
}

export function CmsHeroMedia({
  imageUrl,
  title,
  showFallback = true,
}: CmsHeroMediaProps) {
  if (imageUrl) {
    return (
      <div className={styles.heroMedia}>
        <img src={imageUrl} alt={title} className={styles.heroImage} />
      </div>
    )
  }

  if (!showFallback) {
    return null
  }

  return (
    <div
      className={styles.heroMediaFallback}
      aria-hidden="true"
      data-testid="cms-hero-media-fallback"
    />
  )
}
