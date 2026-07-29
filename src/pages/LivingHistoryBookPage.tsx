import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  publicBookshelfApi,
  type PublicBookshelfEntry,
} from '../api/bookshelfApi'
import { DocumentFlipbook } from '../components/flipbook/DocumentFlipbook'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './LivingHistoryBookPage.module.css'

type LoadStatus = 'loading' | 'ready' | 'error'

export function LivingHistoryBookPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const [book, setBook] = useState<PublicBookshelfEntry | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    let cancelled = false

    async function loadBook() {
      if (!bookId || !/^\d+$/.test(bookId)) {
        setBook(null)
        setStatus('error')
        return
      }

      setStatus('loading')
      setBook(null)

      try {
        const detail = await publicBookshelfApi.getBook(bookId)
        if (!cancelled) {
          setBook(detail)
          setStatus('ready')
        }
      } catch {
        if (!cancelled) {
          setBook(null)
          setStatus('error')
        }
      }
    }

    void loadBook()

    return () => {
      cancelled = true
    }
  }, [bookId])

  usePageBreadcrumbs([
    { label: 'Our Story', href: '/our-story' },
    { label: 'Living History Hub', href: '/living-history-hub' },
    { label: book?.title.trim() || 'Book' },
  ])

  const summary =
    book?.bookTeaser.trim() ||
    book?.description.trim() ||
    book?.authorBio.trim() ||
    ''

  usePageSeo({
    title: book ? `${book.title} | ${SITE_NAME}` : `Book | ${SITE_NAME}`,
    description: summary || 'Read a book from the Living History Hub.',
    canonicalPath: `/living-history-hub/books/${bookId ?? ''}`,
  })

  const flipbookSource = useMemo(() => {
    if (!book?.hasBookFile || !book.bookContentUrl.trim()) {
      return null
    }

    if (isPdfBook(book)) {
      return {
        kind: 'pdf' as const,
        url: book.bookContentUrl,
        fileName: book.bookFileName || `${book.title}.pdf`,
      }
    }

    if (isImageBook(book)) {
      return {
        kind: 'images' as const,
        pages: [
          {
            id: Number(book.id),
            title: book.title,
            altText: book.title,
            imageUrl: book.bookContentUrl,
          },
        ],
      }
    }

    return null
  }, [book])

  if (status === 'loading') {
    return (
      <ReaderState
        title="Loading book..."
        message="Preparing this book for reading."
      />
    )
  }

  if (status === 'error' || !book) {
    return (
      <ReaderState
        title="Book unavailable"
        message="This book is unavailable right now. Please return to the Living History Hub and try another title."
      />
    )
  }

  if (!flipbookSource) {
    return (
      <ReaderState
        title={book.title}
        message="This uploaded file cannot be displayed in the flipbook."
        fileUrl={book.hasBookFile ? book.bookContentUrl : undefined}
      />
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.cover} aria-hidden="true">
            {book.hasCoverImage && book.coverImageContentUrl ? (
              <img src={book.coverImageContentUrl} alt="" />
            ) : (
              <BookMarkIcon />
            )}
          </div>

          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>Living History Hub · Bookshelf</p>
            <h1>{book.title}</h1>
            {book.author.trim() ? (
              <p className={styles.author}>By {book.author}</p>
            ) : null}
            {summary ? <p className={styles.description}>{summary}</p> : null}
            <div className={styles.headerActions}>
              <Link to="/living-history-hub" className={styles.primaryLink}>
                <ArrowLeftIcon />
                Back to the hub
              </Link>
              <a
                href={book.bookContentUrl}
                className={styles.secondaryLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original file
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.readerSection}>
        <div className={styles.readerHeading}>
          <div>
            <p className={styles.eyebrow}>Digital reader</p>
            <h2>Read the book</h2>
          </div>
          <p>Turn pages with the arrows, slider, keyboard, or a swipe.</p>
        </div>

        <section className={styles.reader} aria-label={`Read ${book.title}`}>
          <DocumentFlipbook
            source={flipbookSource}
            title={book.title}
            theme="cookbook"
          />
        </section>
      </main>
    </div>
  )
}

function ReaderState({
  title,
  message,
  fileUrl,
}: {
  title: string
  message: string
  fileUrl?: string
}) {
  return (
    <div className={styles.page}>
      <section className={styles.state}>
        <div className={styles.stateIcon} aria-hidden="true">
          <BookMarkIcon />
        </div>
        <p className={styles.eyebrow}>Living History Hub</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className={styles.headerActions}>
          <Link to="/living-history-hub" className={styles.primaryLink}>
            <ArrowLeftIcon />
            Back to Living History Hub
          </Link>
          {fileUrl ? (
            <a
              href={fileUrl}
              className={styles.secondaryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open original file
            </a>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function isPdfBook(book: PublicBookshelfEntry) {
  return (
    book.bookMimeType.trim().toLowerCase().includes('pdf') ||
    book.bookFileName.trim().toLowerCase().endsWith('.pdf')
  )
}

function isImageBook(book: PublicBookshelfEntry) {
  const mimeType = book.bookMimeType.trim().toLowerCase()
  const extension = book.bookFileName.split('.').pop()?.trim().toLowerCase()

  return (
    mimeType.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension ?? '')
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M19 12H5m6-6-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookMarkIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M13 8h31a7 7 0 0 1 7 7v41H19a7 7 0 0 1-7-7V9a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M19 43h32M19 43a6.5 6.5 0 1 0 0 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M35 8v19l-6-4-6 4V8" fill="currentColor" />
    </svg>
  )
}
