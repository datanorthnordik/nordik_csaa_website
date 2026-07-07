import { useEffect, useState } from 'react'
import {
  publicBookshelfApi,
  type PublicBookshelfEntry,
  type PublicBookshelfListPageMeta,
} from '../api/bookshelfApi'
import { DocumentViewerModal } from '../components/documents/DocumentViewerModal'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { WEBSITE_ASSET_URLS } from '../constants/websiteAssetUrls'
import { downloadPublicFile } from '../lib/fileDownload'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './CommunityBookshelfPage.module.css'

const COVER_TONES = 5
const PAGE_SIZE = 10

const defaultPagination: PublicBookshelfListPageMeta = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
}

export function CommunityBookshelfPage() {
  const [books, setBooks] = useState<PublicBookshelfEntry[]>([])
  const [pagination, setPagination] =
    useState<PublicBookshelfListPageMeta>(defaultPagination)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBook, setSelectedBook] = useState<PublicBookshelfEntry | null>(null)

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
    const timeout = window.setTimeout(() => {
      setPage(1)
      setActiveSearchTerm(searchTerm.trim())
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [searchTerm])

  useEffect(() => {
    let ignore = false

    async function loadBooks() {
      setError(null)
      setIsLoading(page === 1)
      setIsLoadingMore(page > 1)

      try {
        const response = await publicBookshelfApi.listBooks({
          page,
          pageSize: PAGE_SIZE,
          searchTerm: activeSearchTerm,
        })

        if (!ignore) {
          setBooks((current) =>
            page === 1 ? response.items : mergeBooks(current, response.items),
          )
          setPagination(response.pagination)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(getErrorMessage(loadError))
          if (page === 1) {
            setBooks([])
            setPagination(defaultPagination)
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    }

    void loadBooks()

    return () => {
      ignore = true
    }
  }, [activeSearchTerm, page])

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <p className={styles.eyebrow}>Community Circle</p>
          <h1 className={styles.introTitle}>The Bookshelf</h1>
          <img src="/cookbook/1.png" alt="" aria-hidden="true" className={styles.ruleImg} />
          <p className={styles.introLead}>
            A shelf of books and writings that carry our history forward. Search by
            title or author, open a book, and read directly in the shared viewer.
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
            <p className={styles.resultCount}>{formatResultCount(pagination.totalItems)}</p>
          ) : null}
        </div>

        {error ? <p className={styles.errorText}>{error}</p> : null}

        {isLoading ? (
          <div className={styles.cardGrid} aria-label="Loading books">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} aria-hidden="true" />
            ))}
          </div>
        ) : books.length ? (
          <>
            <div className={styles.cardGrid} aria-labelledby="bookshelf-heading">
              {books.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  toneIndex={index % COVER_TONES}
                  onOpen={() => setSelectedBook(book)}
                />
              ))}
            </div>

            {pagination.hasNext ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreButton}
                  disabled={isLoadingMore}
                  onClick={() => setPage((current) => current + 1)}
                >
                  {isLoadingMore ? 'Loading...' : 'Show more'}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>No books found</h3>
            <p>
              {activeSearchTerm
                ? 'Try another title or author, or check back soon for more additions.'
                : 'No books are on the shelf yet. Please check back soon.'}
            </p>
          </div>
        )}
      </section>

      {selectedBook ? (
        <DocumentViewerModal
          title={selectedBook.title}
          eyebrow="The Bookshelf"
          description={buildViewerDescription(selectedBook)}
          previewUrl={selectedBook.bookContentUrl}
          mimeType={selectedBook.bookMimeType || 'application/pdf'}
          onClose={() => setSelectedBook(null)}
          sidebar={
            <div className={styles.modalSidebar}>
              <BookCover
                book={selectedBook}
                toneIndex={Number(selectedBook.id) % COVER_TONES}
                className={styles.modalCover}
              />

              <p className={styles.modalDocumentMeta}>{buildDocumentMeta(selectedBook)}</p>

              <div className={styles.modalAuthorRow}>
                {selectedBook.hasAuthorImage ? (
                  <img
                    src={selectedBook.authorImageContentUrl}
                    alt={`Portrait of ${selectedBook.author}`}
                    className={styles.modalAuthorImage}
                  />
                ) : (
                  <div className={styles.modalAuthorFallback} aria-hidden="true">
                    {getAuthorInitials(selectedBook.author)}
                  </div>
                )}

                <div className={styles.modalAuthorMeta}>
                  <p className={styles.modalMetaLabel}>Author</p>
                  <h3>{selectedBook.author || 'Unknown author'}</h3>
                </div>
              </div>

              {selectedBook.description.trim() ? (
                <section className={styles.modalSection}>
                  <h3>About this book</h3>
                  <p>{selectedBook.description.trim()}</p>
                </section>
              ) : null}

              {selectedBook.authorBio.trim() ? (
                <section className={styles.modalSection}>
                  <h3>About the author</h3>
                  <p>{selectedBook.authorBio.trim()}</p>
                </section>
              ) : null}
            </div>
          }
          controls={
            <>
              {selectedBook.bookLink.trim() ? (
                <a
                  href={selectedBook.bookLink}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.modalSecondaryAction}
                >
                  Visit book link
                </a>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  downloadPublicFile(
                    selectedBook.bookContentUrl,
                    getBookFileName(selectedBook),
                  )
                }
              >
                Download book
              </button>
            </>
          }
        />
      ) : null}
    </main>
  )
}

type BookCardProps = {
  book: PublicBookshelfEntry
  toneIndex: number
  onOpen: () => void
}

function BookCard({ book, toneIndex, onOpen }: BookCardProps) {
  const canOpen = Boolean(book.bookContentUrl)

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.coverButton}
        onClick={onOpen}
        disabled={!canOpen}
        aria-label={`Open book: ${book.title}`}
      >
        <BookCover book={book} toneIndex={toneIndex} />
      </button>

      <div className={styles.cardBody}>
        <p className={styles.cardAuthor}>{book.author || 'Unknown author'}</p>
        <h3 className={styles.cardTitle}>{book.title}</h3>
        <p className={styles.cardTeaser}>{getBookLead(book)}</p>
      </div>

      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.primaryAction}
          onClick={onOpen}
          disabled={!canOpen}
          aria-label={`Open book: ${book.title}`}
        >
          {canOpen ? 'Open book' : 'Unavailable'}
        </button>
      </div>
    </article>
  )
}

function BookCover({
  book,
  toneIndex,
  className,
}: {
  book: PublicBookshelfEntry
  toneIndex: number
  className?: string
}) {
  const coverClassName = className ? `${styles.cover} ${className}` : styles.cover

  if (book.hasCoverImage && book.coverImageContentUrl) {
    return (
      <div className={coverClassName}>
        <img
          src={book.coverImageContentUrl}
          alt={`Cover of ${book.title}`}
          className={styles.coverImg}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className={coverClassName}>
      <div className={`${styles.coverPlaceholder} ${styles[`tone${toneIndex}`]}`}>
        <span className={styles.coverPlaceholderLabel}>The Bookshelf</span>
        <span className={styles.coverPlaceholderTitle}>{book.title}</span>
        <span className={styles.coverPlaceholderAuthor}>{book.author}</span>
      </div>
    </div>
  )
}

function mergeBooks(
  current: PublicBookshelfEntry[],
  next: PublicBookshelfEntry[],
) {
  const seen = new Set(current.map((item) => item.id))
  return [...current, ...next.filter((item) => !seen.has(item.id))]
}

function getBookLead(book: PublicBookshelfEntry) {
  return (
    book.bookTeaser.trim() ||
    book.description.trim() ||
    book.authorBio.trim() ||
    'Open this title to read more from the community bookshelf.'
  )
}

function buildViewerDescription(book: PublicBookshelfEntry) {
  return (
    book.bookTeaser.trim() ||
    book.description.trim() ||
    `Read ${book.title} from the community bookshelf.`
  )
}

function getBookFileName(book: PublicBookshelfEntry) {
  const trimmedFileName = book.bookFileName.trim()
  const trimmedTitle = book.title.trim()

  return trimmedFileName || `${trimmedTitle || 'bookshelf-book'}.pdf`
}

function buildDocumentMeta(book: PublicBookshelfEntry) {
  const parts = [getDocumentLabel(book)]
  const sizeLabel = formatFileSize(book.bookFileSize)

  if (sizeLabel) {
    parts.push(sizeLabel)
  }

  return parts.join(' · ')
}

function getDocumentLabel(book: PublicBookshelfEntry) {
  const mimeType = book.bookMimeType.trim().toLowerCase()
  if (mimeType === 'application/pdf') {
    return 'PDF'
  }
  if (mimeType.startsWith('image/')) {
    return mimeType.replace('image/', '').toUpperCase()
  }

  const ext = book.bookFileName.trim().split('.').pop()?.trim()
  return ext ? ext.toUpperCase() : 'Document'
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return ''
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const digits = value >= 10 || unitIndex === 0 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unitIndex]}`
}

function formatResultCount(totalItems: number) {
  return `${totalItems} ${totalItems === 1 ? 'book' : 'books'}`
}

function getAuthorInitials(author: string) {
  const words = author
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)

  if (!words.length) {
    return 'BK'
  }

  return words.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load the bookshelf.'
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.8 10.8 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
