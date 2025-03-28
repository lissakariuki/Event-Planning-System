// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands"

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add testing library commands
import "@testing-library/cypress/add-commands"

// Disable uncaught exception handling
Cypress.on("uncaught:exception", () => {
  // Return false to prevent Cypress from failing the test
  return false
})

// Add other global imports or setup
beforeEach(() => {
  cy.log(`Running test: ${Cypress.currentTest.title}`)
})

