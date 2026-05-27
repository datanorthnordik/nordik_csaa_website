import styles from './QuoteBanner.module.css'

type QuoteBannerProps = {
  quote: string
  attribution?: string
}

export function QuoteBanner({ quote, attribution }: QuoteBannerProps) {
  const trimmedQuote = quote.trim()
  const trimmedAttribution = attribution?.trim() ?? ''

  if (!trimmedQuote) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <LibraryIcon />
        <blockquote className={styles.quote}>{trimmedQuote}</blockquote>
        {trimmedAttribution ? (
          <div className={styles.rule} aria-hidden="true">
            <span className={styles.ruleLine} />
            <span className={styles.ruleText}>{trimmedAttribution}</span>
            <span className={styles.ruleLine} />
          </div>
        ) : null}
      </div>
    </section>
  )
}

function LibraryIcon() {
  return (
    <svg
      className={styles.icon}
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
    </svg>
  )
}
