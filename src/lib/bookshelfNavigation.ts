import type { PublicBookshelfEntry } from '../api/bookshelfApi'

export type BookshelfDestination =
  | { kind: 'reader'; href: string }
  | { kind: 'external'; href: string }

export function getBookshelfDestination(
  book: Pick<PublicBookshelfEntry, 'id' | 'bookLink' | 'hasBookFile'>,
): BookshelfDestination | null {
  if (book.hasBookFile) {
    return {
      kind: 'reader',
      href: `/living-history-hub/books/${encodeURIComponent(book.id)}`,
    }
  }

  const bookLink = book.bookLink.trim()
  return bookLink ? { kind: 'external', href: bookLink } : null
}
