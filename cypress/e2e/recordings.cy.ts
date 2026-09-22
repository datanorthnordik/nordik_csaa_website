describe('Recordings page', () => {
  it('loads collections, expands an item, and shows the pending recording state', () => {
    cy.intercept('GET', '**/api/menus/main', {
      statusCode: 200,
      body: { id: 1, menu_key: 'main', name: 'Main menu', items: [] },
    })
    cy.intercept('GET', '**/api/recordings', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 7,
            name: 'Community Gatherings',
            item_count: 1,
            created_at: '2026-09-20T10:00:00Z',
            updated_at: '2026-09-20T10:00:00Z',
          },
        ],
      },
    }).as('listRecordings')
    cy.intercept('GET', '**/api/recordings/7', {
      statusCode: 200,
      body: {
        id: 7,
        name: 'Community Gatherings',
        item_count: 1,
        items: [
          {
            id: 11,
            recording_collection_id: 7,
            title: 'September gathering',
            description: 'The recording will be added later.',
            recording_url: '',
            sort_order: 0,
            created_at: '2026-09-20T10:00:00Z',
            updated_at: '2026-09-20T10:00:00Z',
          },
        ],
        created_at: '2026-09-20T10:00:00Z',
        updated_at: '2026-09-20T10:00:00Z',
      },
    }).as('getRecordingCollection')

    cy.visit('/recordings')
    cy.wait('@listRecordings')

    cy.get('h1').contains('Recordings').should('be.visible')
    cy.get('button').contains('Community Gatherings').click()
    cy.wait('@getRecordingCollection')

    cy.get('h2').contains('September gathering').should('be.visible')
    cy.contains('The recording will be added later.').should('be.visible')
    cy.contains('Recording coming soon.').should('be.visible')
  })
})
