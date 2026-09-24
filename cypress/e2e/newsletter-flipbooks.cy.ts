describe('Newsletter flipbooks', () => {
  it('switches between named books and downloads the complete version archive', () => {
    cy.intercept('GET', '**/api/menus/main', {
      statusCode: 200,
      body: { id: 1, menu_key: 'main', name: 'Main menu', items: [] },
    })
    cy.intercept('GET', '**/api/newsletters/24', {
      statusCode: 200,
      body: {
        id: 24,
        title: 'Community Stories',
        category: 'csaa',
        send_date: '2026-09-01T00:00:00Z',
        content_html: '<p>Stories shared by our community.</p>',
        status: 'published',
        visibility: 'public',
        publish_at: null,
        media: [
          {
            id: 601,
            display_name: 'English Book',
            file_name: 'community-stories-en.pdf',
            file_url: '/api/newsletters/24/media/601/content',
            mime_type: 'application/pdf',
            file_size: 1024,
            media_role: 'attachment',
            sort_order: 0,
            created_at: '2026-09-01T00:00:00Z',
            updated_at: '2026-09-01T00:00:00Z',
          },
          {
            id: 602,
            display_name: 'French Book',
            file_name: 'community-stories-fr.pdf',
            file_url: '/api/newsletters/24/media/602/content',
            mime_type: 'application/pdf',
            file_size: 1024,
            media_role: 'attachment',
            sort_order: 1,
            created_at: '2026-09-01T00:00:00Z',
            updated_at: '2026-09-01T00:00:00Z',
          },
        ],
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-09-01T00:00:00Z',
      },
    }).as('newsletter')
    cy.intercept('GET', '**/api/newsletters/24/media/*/content', {
      statusCode: 200,
      headers: { 'content-type': 'application/pdf' },
      body: '',
    })
    cy.intercept('GET', '**/api/newsletters/24/download', {
      statusCode: 200,
      headers: { 'content-type': 'application/zip' },
      body: 'archive',
    }).as('downloadVersion')

    cy.visit('/news-media/digital-newsletter/24')
    cy.wait('@newsletter')

    cy.get('h1').contains('Community Stories').should('be.visible')
    cy.get('[role="tab"]').contains('English Book').should(
      'have.attr',
      'aria-selected',
      'true',
    )
    cy.get('[role="tab"]').contains('French Book').click()
    cy.get('[role="tab"]').contains('French Book').should(
      'have.attr',
      'aria-selected',
      'true',
    )
    cy.get('[role="region"][aria-label*="Community Stories: French Book"]').should(
      'be.visible',
    )

    cy.contains('button', 'Download this version').click()
    cy.wait('@downloadVersion')
  })
})
