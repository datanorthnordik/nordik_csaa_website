import type { CmsGalleryAsset } from './cmsGalleryMedia'
import { CmsGalleryTile } from './CmsGalleryTile'
import styles from './CmsGallerySection.module.css'

type CmsGalleryMasonryProps = {
  items: CmsGalleryAsset[]
  showTitleDescription: boolean
  onOpen: (index: number) => void
}

export function CmsGalleryMasonry({
  items,
  showTitleDescription,
  onOpen,
}: CmsGalleryMasonryProps) {
  return (
    <div className={styles.masonryLayout}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.masonryItem}>
          <CmsGalleryTile
            item={item}
            index={index}
            variant="masonry"
            showTitleDescription={showTitleDescription}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  )
}
