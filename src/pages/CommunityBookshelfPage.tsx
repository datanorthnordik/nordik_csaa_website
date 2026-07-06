import { useEffect, useMemo, useState } from 'react'
import { booksApi, type PublicBookDetail, type PublicBookSummary } from '../api/booksApi'
import { DocumentFlipbook } from '../components/flipbook/DocumentFlipbook'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './CommunityBookshelfPage.module.css'

/**
 * Placeholder author/cover until the books API exposes those fields. When the
 * backend adds them, populate these from the summary in `toBookshelfItem`.
 */
const PLACEHOLDER_AUTHOR = 'Author to be announced'
const COVER_TONES = 5

type BookshelfItem = {
  id: number
  title: string
  description: string
  author: string
  coverUrl: string | null
}

function toBookshelfItem(summary: PublicBookSummary): BookshelfItem {
  return {
    id: summary.id,
    title: summary.title,
    description: summary.description,
    author: PLACEHOLDER_AUTHOR,
    coverUrl: null,
  }
}

export function CommunityBookshelfPage() {
  const [items, setItems] = useState<BookshelfItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [readingBook, setReadingBook] = useState<BookshelfItem | null>(null)

  usePageBreadcrumbs([
    { label: 'Community Circle', href: '/community-circle' },
    { label: 'The Bookshelf' },
  ])

  usePageSeo({
    title: `The Bookshelf | ${SITE_NAME}`,
    description:
      'Browse and read books and writings that carry our history forward, curated for the community.',
    canonicalPath: '/community-circle/bookshelf',
    image: WEBSITE_ASSET_URLS.gatheringsHeroStage,
  })

  useEffect(() => {
    let ignore = false

    async function loadBooks() {
      try {
        setIsLoading(true)
        setError(null)
        const books = await booksApi.listPublicBooks()
        if (!ignore) {
          setItems(books.map(toBookshelfItem))
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : 'Could not load the bookshelf.',
          )
          setItems([])
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadBooks()

    return () => {
      ignore = true
    }
  }, [])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      return items
    }

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.author.toLowerCase().includes(term),
    )
  }, [items, searchTerm])

  const previewItem = previewIndex === null ? null : filteredItems[previewIndex] ?? null

  function openPreview(item: BookshelfItem) {
    const index = filteredItems.findIndex((candidate) => candidate.id === item.id)
    setPreviewIndex(index >= 0 ? index : 0)
  }

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <p className={styles.eyebrow}>Community Circle</p>
          <h1 className={styles.introTitle}>The Bookshelf</h1>
          <img src="/cookbook/1.png" alt="" aria-hidden="true" className={styles.ruleImg} />
          <p className={styles.introLead}>
            A shelf of books and writings that carry our history forward. Search by
            title or author, take a closer look with a preview, then settle in and read.
          </p>

          <form
            className={styles.searchForm}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="search"
              className={styles.searchInput}
              value={searchTerm}
              placeholder="Search by title or author..."
              aria-label="Search books by title or author"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </form>
        </div>
      </section>

      <section className={styles.shelfSection} aria-labelledby="bookshelf-heading">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Featured reads</p>
            <h2 id="bookshelf-heading">Browse the collection</h2>
          </div>
          {!isLoading && !error ? (
            <p className={styles.resultCount}>
              {filteredItems.length} {filteredItems.length === 1 ? 'book' : 'books'}
            </p>
          ) : null}
        </div>

        {error ? <p className={styles.errorText}>{error}</p> : null}

        {isLoading ? (
          <div className={styles.cardGrid} aria-label="Loading books">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} aria-hidden="true" />
            ))}
          </div>
        ) : filteredItems.length ? (
          <div className={styles.cardGrid} aria-labelledby="bookshelf-heading">
            {filteredItems.map((item, index) => (
              <BookCard
                key={item.id}
                item={item}
                toneIndex={index % COVER_TONES}
                onPreview={() => openPreview(item)}
                onRead={() => setReadingBook(item)}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            {searchTerm.trim()
              ? 'No books match your search. Try a different title or author.'
              : 'No books are on the shelf yet. Please check back soon.'}
          </p>
        )}
      </section>

      {previewItem ? (
        <PreviewCarousel
          items={filteredItems}
          index={previewIndex ?? 0}
          onIndexChange={setPreviewIndex}
          onClose={() => setPreviewIndex(null)}
          onRead={(item) => {
            setPreviewIndex(null)
            setReadingBook(item)
          }}
        />
      ) : null}

      {readingBook ? (
        <BookReader book={readingBook} onClose={() => setReadingBook(null)} />
      ) : null}
    </main>
  )
}

type BookCardProps = {
  item: BookshelfItem
  toneIndex: number
  onPreview: () => void
  onRead: () => void
}

function BookCard({ item, toneIndex, onPreview, onRead }: BookCardProps) {
  return (
    <article className={styles.card}>
      <BookCover item={item} toneIndex={toneIndex} />
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardAuthor}>{item.author}</p>
      </div>
      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.previewButton}
          onClick={onPreview}
          aria-label={`Preview ${item.title}`}
        >
          Preview
        </button>
        <button
          type="button"
          className={styles.readButton}
          onClick={onRead}
          aria-label={`Read ${item.title}`}
        >
          Read
        </button>
      </div>
    </article>
  )
}

function BookCover({
  item,
  toneIndex,
  className,
}: {
  item: BookshelfItem
  toneIndex: number
  className?: string
}) {
  const coverClassName = className ? `${styles.cover} ${className}` : styles.cover

  if (item.coverUrl) {
    return (
      <div className={coverClassName}>
        <img src={item.coverUrl} alt={`Cover of ${item.title}`} className={styles.coverImg} loading="lazy" />
      </div>
    )
  }

  return (
    <div className={coverClassName}>
      <div className={`${styles.coverPlaceholder} ${styles[`tone${toneIndex}`]}`}>
        <span className={styles.coverPlaceholderLabel}>The Bookshelf</span>
        <span className={styles.coverPlaceholderTitle}>{item.title}</span>
      </div>
    </div>
  )
}

type PreviewCarouselProps = {
  items: BookshelfItem[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
  onRead: (item: BookshelfItem) => void
}

function PreviewCarousel({ items, index, onIndexChange, onClose, onRead }: PreviewCarouselProps) {
  const canPrev = index > 0
  const canNext = index < items.length - 1

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && index > 0) {
        onIndexChange(index - 1)
      } else if (event.key === 'ArrowRight' && index < items.length - 1) {
        onIndexChange(index + 1)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [index, items.length, onClose, onIndexChange])

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className={styles.carouselPanel}
        role="dialog"
        aria-modal="true"
        aria-label="Book preview"
      >
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close preview">
          <CloseIcon />
        </button>

        <button
          type="button"
          className={`${styles.carouselNav} ${styles.navPrev}`}
          onClick={() => onIndexChange(index - 1)}
          disabled={!canPrev}
          aria-label="Previous book"
        >
          <ChevronIcon direction="left" />
        </button>

        <div className={styles.carouselViewport}>
          <div className={styles.carouselTrack} style={{ transform: `translateX(-${index * 100}%)` }}>
            {items.map((item, itemIndex) => (
              <div key={item.id} className={styles.carouselSlide} aria-hidden={itemIndex !== index}>
                <BookCover item={item} toneIndex={itemIndex % COVER_TONES} className={styles.carouselCover} />
                <div className={styles.carouselInfo}>
                  <p className={styles.carouselEyebrow}>From the bookshelf</p>
                  <h2 className={styles.carouselTitle}>{item.title}</h2>
                  <p className={styles.carouselAuthor}>{item.author}</p>
                  <p className={styles.carouselDesc}>
                    {item.description?.trim() || 'A description for this book is coming soon.'}
                  </p>
                  <button
                    type="button"
                    className={`${styles.readButton} ${styles.carouselReadButton}`}
                    onClick={() => onRead(item)}
                  >
                    Read this book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.carouselNav} ${styles.navNext}`}
          onClick={() => onIndexChange(index + 1)}
          disabled={!canNext}
          aria-label="Next book"
        >
          <ChevronIcon direction="right" />
        </button>

        <p className={styles.carouselCounter}>
          {index + 1} of {items.length}
        </p>
      </section>
    </div>
  )
}

function BookReader({ book, onClose }: { book: BookshelfItem; onClose: () => void }) {
  const [detail, setDetail] = useState<PublicBookDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadDetail() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await booksApi.getPublicBook(book.id)
        if (!ignore) {
          setDetail(result)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : 'This book could not be opened.',
          )
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      ignore = true
    }
  }, [book.id])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const flipbookSource = useMemo(() => {
    if (!detail) {
      return null
    }

    return {
      kind: 'pdf' as const,
      url: booksApi.resolveContentUrl(detail.version.pdfContentUrl),
      fileName: `${detail.title}.pdf`,
    }
  }, [detail])

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className={styles.readerPanel}
        role="dialog"
        aria-modal="true"
        aria-label={`Reading ${book.title}`}
      >
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close reader">
          <CloseIcon />
        </button>

        <div className={styles.readerHeader}>
          <h2>{book.title}</h2>
          <p className={styles.readerAuthor}>{book.author}</p>
        </div>

        {isLoading ? (
          <div className={styles.readerLoading}>Opening book...</div>
        ) : error ? (
          <div className={styles.readerError}>{error}</div>
        ) : detail && flipbookSource ? (
          <DocumentFlipbook source={flipbookSource} title={detail.title} />
        ) : (
          <div className={styles.readerError}>This book is not available right now.</div>
        )}
      </section>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.8 10.8 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
