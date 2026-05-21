import type { CmsGalleryAsset } from './cmsGalleryMedia'
import styles from './CmsGallerySection.module.css'

type CmsGalleryIconsProps = {
  items: CmsGalleryAsset[]
}

export function CmsGalleryIcons({ items }: CmsGalleryIconsProps) {
  return (
    <div className={styles.iconGridLayout}>
      {items.map((item) => {
        const label = item.title || item.altText
        const content = (
          <>
            <img src={item.imageUrl} alt={item.altText} className={styles.iconTileImage} />
            <span className={styles.visuallyHidden}>{label}</span>
          </>
        )

        return item.linkUrl ? (
          <a
            key={item.id}
            href={item.linkUrl}
            className={styles.iconTileLink}
            aria-label={label}
          >
            {content}
          </a>
        ) : (
          <div key={item.id} className={styles.iconTileStatic} aria-label={label}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
