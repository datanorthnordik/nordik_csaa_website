import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryTile } from './CmsGalleryTile'
import styles from './CmsGallerySection.module.css'

type CmsGalleryGridProps = {
  items: CmsGalleryAsset[]
  showTitleDescription: boolean
  onOpen: (index: number) => void
}

export function CmsGalleryGrid({
  items,
  showTitleDescription,
  onOpen,
}: CmsGalleryGridProps) {
  return (
    <div className={styles.gridLayout}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.gridItem}>
          <CmsGalleryTile
            item={item}
            index={index}
            variant="grid"
            showTitleDescription={showTitleDescription}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  )
}
