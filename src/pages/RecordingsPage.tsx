import { useCallback, useEffect, useRef, useState } from 'react'
import {
  recordingsApi,
  type RecordingCollectionSummary,
  type RecordingItemResponse,
} from '../api/recordingsApi'
import { resolveApiUrl } from '../constants/api'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './RecordingsPage.module.css'

export function RecordingsPage() {
  usePageBreadcrumbs([{ label: 'Recordings' }])

  usePageSeo({
    title: `Recordings | ${SITE_NAME}`,
    description:
      'Listen to recorded stories, gatherings, and oral histories shared by our community.',
    canonicalPath: '/recordings',
  })

  const [collections, setCollections] = useState<RecordingCollectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [items, setItems] = useState<RecordingItemResponse[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [itemsError, setItemsError] = useState('')
  const itemRequestSequence = useRef(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await recordingsApi.listCollections()
        if (!cancelled) {
          setCollections(data.items ?? [])
        }
      } catch {
        if (!cancelled) {
          setLoadError('We could not load the recordings right now. Please try again later.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const toggleCollection = useCallback(
    async (collectionId: number) => {
      if (expandedId === collectionId) {
        itemRequestSequence.current += 1
        setExpandedId(null)
        return
      }

      const requestSequence = itemRequestSequence.current + 1
      itemRequestSequence.current = requestSequence
      setExpandedId(collectionId)
      setItems([])
      setItemsError('')
      setItemsLoading(true)

      try {
        const detail = await recordingsApi.getCollection(collectionId)
        if (itemRequestSequence.current === requestSequence) {
          setItems(detail.items ?? [])
        }
      } catch {
        if (itemRequestSequence.current === requestSequence) {
          setItemsError('We could not load these recordings. Please try again.')
        }
      } finally {
        if (itemRequestSequence.current === requestSequence) {
          setItemsLoading(false)
        }
      }
    },
    [expandedId],
  )

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Our Story</p>
        <h1 className={styles.title}>Recordings</h1>
        <p className={styles.lead}>
          Recorded stories, gatherings, and oral histories shared by our community.
        </p>
      </section>

      <section className={styles.section}>
        {loading ? (
          <p className={styles.state} role="status">
            Loading recordings…
          </p>
        ) : null}

        {!loading && loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : null}

        {!loading && !loadError && collections.length === 0 ? (
          <p className={styles.state}>No recordings have been published yet.</p>
        ) : null}

        <ul className={styles.list}>
          {collections.map((collection) => {
            const isExpanded = expandedId === collection.id

            return (
              <li key={collection.id} className={styles.collection}>
                <button
                  type="button"
                  className={styles.collectionButton}
                  aria-expanded={isExpanded}
                  aria-controls={`recording-collection-${collection.id}`}
                  onClick={() => {
                    void toggleCollection(collection.id)
                  }}
                >
                  <span className={styles.collectionName}>{collection.name}</span>
                  <span className={styles.collectionCount}>
                    {collection.item_count} {collection.item_count === 1 ? 'item' : 'items'}
                  </span>
                </button>

                {isExpanded ? (
                  <div id={`recording-collection-${collection.id}`} className={styles.items}>
                    {itemsLoading ? (
                      <p className={styles.state} role="status">
                        Loading items…
                      </p>
                    ) : null}

                    {!itemsLoading && itemsError ? (
                      <p className={styles.error} role="alert">
                        {itemsError}
                      </p>
                    ) : null}

                    {!itemsLoading && !itemsError && items.length === 0 ? (
                      <p className={styles.state}>This collection has no items yet.</p>
                    ) : null}

                    <ul className={styles.itemList}>
                      {items.map((item) => (
                        <li key={item.id} className={styles.item}>
                          <h2 className={styles.itemTitle}>{item.title}</h2>
                          {item.description ? (
                            <p className={styles.itemDescription}>{item.description}</p>
                          ) : null}
                          {item.recording_url ? (
                            <audio
                              className={styles.audio}
                              controls
                              preload="none"
                              src={resolveApiUrl(item.recording_url)}
                              aria-label={`Recording: ${item.title}`}
                            />
                          ) : (
                            <p className={styles.pending}>Recording coming soon.</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
