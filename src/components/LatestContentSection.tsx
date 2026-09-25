import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  latestContentApi,
  type LatestContentItem,
  type LatestContentSourceType,
} from '../api/latestContentApi'
import { formatLatestContentDate } from '../lib/latestContent'
import styles from './LatestContentSection.module.css'

const HOME_ITEM_LIMIT = 3

export function LatestContentSection() {
  const { i18n, t } = useTranslation()
  const [items, setItems] = useState<LatestContentItem[]>([])

  useEffect(() => {
    let ignore = false

    async function loadLatestContent() {
      try {
        const response = await latestContentApi.listLatestContent(HOME_ITEM_LIMIT)
        if (!ignore) {
          setItems(response.slice(0, HOME_ITEM_LIMIT))
        }
      } catch {
        if (!ignore) {
          setItems([])
        }
      }
    }

    void loadLatestContent()

    return () => {
      ignore = true
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  const locale = i18n.resolvedLanguage ?? i18n.language

  return (
    <section
      className={styles.section}
      aria-label={t('latestContent.ariaLabel')}
    >
      <div className={styles.grid}>
        {items.map((item) => (
          <article className={styles.card} key={`${item.sourceType}-${item.sourceId}`}>
            <p className={styles.category}>
              {t(`latestContent.categories.${item.sourceType}`)}
            </p>
            <h2 className={styles.title}>{item.title}</h2>
            <p className={styles.description}>
              {item.description || t(`latestContent.fallbacks.${item.sourceType}`)}
            </p>
            <time className={styles.date} dateTime={item.displayDate}>
              {formatLatestContentDate(item.displayDate, locale)}
            </time>
            <Link className={styles.link} to={item.detailPath}>
              {t(`latestContent.links.${linkKey(item.sourceType)}`)}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function linkKey(sourceType: LatestContentSourceType) {
  return sourceType === 'event' ? 'event' : 'news'
}
