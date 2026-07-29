describe('Living History dynamic blog layout', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.visit('/living-history-hub')
    cy.contains('h2', 'Stories & Editions', { timeout: 20000 }).scrollIntoView()
  })

  it('routes list cards to their own blog page and restores article and immersive layouts', () => {
    cy.contains('a', 'Dan Pine & the Pine Trees', { timeout: 20000 })
      .find('span')
      .first()
      .should('have.css', 'background-image')
      .and('include', 'nordikcsaaapi')

    cy.contains('a', 'Dan Pine & the Pine Trees').click()
    cy.location('pathname').should('include', '/living-history-hub/')
    cy.contains('h1', 'Dan Pine & the Pine Trees', { timeout: 20000 }).should('be.visible')
    cy.get('figure img')
      .first()
      .should('be.visible')
      .then(($image) => {
        expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0)
      })
    cy.screenshot('living-history-dan-pine')

    cy.contains('a', 'All stories').click()
    cy.contains('h2', 'Stories & Editions', { timeout: 20000 }).scrollIntoView()

    cy.contains('a', 'The Tree Planting', { timeout: 20000 }).click()
    cy.contains('h1', 'The Tree Planting', { timeout: 20000 }).should('be.visible')
    cy.get('button[aria-label="Play The Tree Planting"]')
      .should('be.visible')
      .parents('div')
      .first()
      .should('have.css', 'position', 'relative')
    cy.contains('h2', 'The First Root').scrollIntoView().should('be.visible')
    cy.screenshot('living-history-tree-planting')
  })
})
