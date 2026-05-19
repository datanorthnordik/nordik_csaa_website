import styles from './CmsSectionBlocks.module.css'

type CmsHeroMediaProps = {
  imageUrl: string | null
  title: string
}

export function CmsHeroMedia({ imageUrl, title }: CmsHeroMediaProps) {
  if (imageUrl) {
    return (
      <div className={styles.heroMedia}>
        <img src={imageUrl} alt={title} className={styles.heroImage} />
      </div>
    )
  }

  return <div className={styles.heroMediaFallback} aria-hidden="true" />
}
