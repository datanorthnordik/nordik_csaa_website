import type { CmsGalleryAsset } from './cmsGalleryMedia'
import styles from './CmsGallerySection.module.css'

type CmsGalleryTileProps = {
  item: CmsGalleryAsset
  index: number
  variant: 'grid' | 'masonry'
  onOpen: (index: number) => void
}

export function CmsGalleryTile({
  item,
  index,
  variant,
  onOpen,
}: CmsGalleryTileProps) {
  const label = item.title || item.altText

  return (
    <button
      type="button"
      className={`${styles.tileButton} ${
        variant === 'grid' ? styles.gridImageWrap : styles.masonryImageWrap
      }`}
      onClick={() => onOpen(index)}
      aria-label={label}
    >
      <img
        src={item.imageUrl}
        alt={item.altText}
        className={`${styles.tileImage} ${
          variant === 'masonry' ? styles.masonryImage : ''
        }`}
      />
      <span className={styles.tileShade} aria-hidden="true" />
      <span className={styles.tileMeta}>
        <strong className={styles.tileTitle}>{label}</strong>
        {item.details && item.details !== label ? (
          <span className={styles.tileDetails}>{item.details}</span>
        ) : null}
      </span>
    </button>
  )
}
