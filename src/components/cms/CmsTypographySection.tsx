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

  const resolvedHtml = html ? optimizeRichTextMedia(html) : ''

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
            dangerouslySetInnerHTML={{ __html: resolvedHtml }}
          />
        ) : (
          <p className={styles.plainText}>{text}</p>
        )}
      </div>
    </section>
  )
}

function optimizeRichTextMedia(html: string) {
  if (!/<img\s/i.test(html) || typeof DOMParser === 'undefined') {
    return html
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  let didMutate = false

  doc.body.querySelectorAll('img').forEach((image) => {
    if (!image.getAttribute('loading')) {
      image.setAttribute('loading', 'lazy')
      didMutate = true
    }

    if (!image.getAttribute('decoding')) {
      image.setAttribute('decoding', 'async')
      didMutate = true
    }

    if (!image.getAttribute('fetchpriority')) {
      image.setAttribute('fetchpriority', 'low')
      didMutate = true
    }
  })

  return didMutate ? doc.body.innerHTML : html
}
