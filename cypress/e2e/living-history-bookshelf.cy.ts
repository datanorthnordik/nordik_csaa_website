type BookshelfEntryOverrides = Partial<{
  id: number
  title: string
  book_link: string
  book_file_name: string
  book_mime_type: string
  book_file_size: number
  book_content_url: string
}>

describe('Living History bookshelf', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
  })

  it('opens an uploaded book in the flipbook page with breadcrumbs', () => {
    const uploadedBook = createBookshelfEntry()

    interceptBookshelfList([uploadedBook])
    cy.intercept('GET', '**/api/bookshelf/101', {
      statusCode: 200,
      body: uploadedBook,
    }).as('bookDetail')
    cy.intercept('GET', '**/api/bookshelf/101/book/content', {
      statusCode: 404,
      body: '',
    })

    cy.visit('/living-history-hub')
    cy.contains('button', 'Bookshelf').scrollIntoView().click()
    cy.wait('@bookshelfList')

    cy.contains('a', 'Open book')
      .should('have.attr', 'href', '/living-history-hub/books/101')
      .click()

    cy.wait('@bookDetail')
    cy.location('pathname').should('equal', '/living-history-hub/books/101')
    cy.contains('h1', 'Uploaded History').should('be.visible')
    cy.get('nav[aria-label*="readcrumb"]').within(() => {
      cy.contains('a', 'Living History Hub')
        .should('have.attr', 'href', '/living-history-hub')
      cy.contains('Uploaded History').should('be.visible')
    })
    cy.contains('h2', 'Read the book').should('be.visible')
    cy.get('section[aria-label="Read Uploaded History"]').should('be.visible')
  })

  it('uses the configured link when the entry has no uploaded book', () => {
    const linkedBook = createBookshelfEntry({
      id: 202,
      title: 'Linked History',
      book_link: 'https://example.com/linked-history',
      book_file_name: '',
      book_mime_type: '',
      book_file_size: 0,
      book_content_url: '',
    })

    interceptBookshelfList([linkedBook])

    cy.visit('/living-history-hub')
    cy.contains('button', 'Bookshelf').scrollIntoView().click()
    cy.wait('@bookshelfList')

    cy.contains('a', 'Open book')
      .should('have.attr', 'href', 'https://example.com/linked-history')
  })
})

function interceptBookshelfList(
  items: Array<ReturnType<typeof createBookshelfEntry>>,
) {
  cy.intercept('GET', /\/api\/bookshelf(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      items,
      pagination: {
        page: 1,
        page_size: 100,
        total_items: items.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
      summary: {
        with_cover_count: 0,
        without_cover_count: items.length,
      },
      applied_filters: {
        page: 1,
        page_size: 100,
        search_term: '',
      },
    },
  }).as('bookshelfList')
}

function createBookshelfEntry(overrides: BookshelfEntryOverrides = {}) {
  return {
    id: 101,
    author: 'Community Archivist',
    title: 'Uploaded History',
    book_link: 'https://example.com/fallback',
    author_bio: 'A community historian.',
    book_teaser: 'Stories carried forward through generations.',
    description: 'A book from the Living History collection.',
    book_file_name: 'uploaded-history.pdf',
    book_mime_type: 'application/pdf',
    book_file_size: 4096,
    book_content_url: '/api/bookshelf/101/book/content',
    author_image_file_name: '',
    author_image_mime_type: '',
    author_image_file_size: 0,
    has_author_image: false,
    author_image_content_url: '',
    cover_image_file_name: '',
    cover_image_mime_type: '',
    cover_image_file_size: 0,
    has_cover_image: false,
    cover_image_content_url: '',
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...overrides,
  }
}
