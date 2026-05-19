import type { PageSection } from '../../api/pagesApi'
import styles from './CmsSectionBlocks.module.css'

type CmsTypographySectionProps = {
  section: PageSection
}

export function CmsTypographySection({ section }: CmsTypographySectionProps) {
  const typography = section.typography
  if (!typography) {
    return null
  }

  const html = typography.html_content.trim()
  const text = typography.text_content.trim()
  if (!html && !text) {
    return null
  }

  const alignmentClass =
    typography.text_align === 'center'
      ? styles.alignCenter
      : typography.text_align === 'right'
        ? styles.alignRight
        : styles.alignLeft

  return (
    <section className={`${styles.section} ${styles.typographySection}`}>
      <div className={`${styles.typographyCard} ${alignmentClass}`}>
        {html ? (
          <div
            className={styles.richText}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className={styles.plainText}>{text}</p>
        )}
      </div>
    </section>
  )
}
