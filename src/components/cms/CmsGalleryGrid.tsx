import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryTile } from './CmsGalleryTile'
import styles from './CmsGallerySection.module.css'

type CmsGalleryGridProps = {
  items: CmsGalleryAsset[]
  onOpen: (index: number) => void
}

export function CmsGalleryGrid({ items, onOpen }: CmsGalleryGridProps) {
  return (
    <div className={styles.gridLayout}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.gridItem}>
          <CmsGalleryTile item={item} index={index} variant="grid" onOpen={onOpen} />
        </div>
      ))}
    </div>
  )
}
