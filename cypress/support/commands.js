// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// This file is processed and loaded automatically before your test files

// Define custom commands here
Cypress.Commands.add("loginMockUser", () => {
  // Mock login without actually visiting the page
  cy.log("Mock user logged in")
})

Cypress.Commands.add("createTestTeam", () => {
  // Mock team creation
  cy.log("Test team created")
})

// Command to navigate to events page
Cypress.Commands.add("navigateToEvents", () => {
  cy.visit("/events")
  // Wait for the page to load
  cy.get('[data-cy="events-header"]', { timeout: 10000 })
})

// Command to navigate to tasks page
Cypress.Commands.add("navigateToTasks", () => {
  cy.visit("/tasks")
  // Wait for the page to load
  cy.get('[data-cy="tasks-header"]', { timeout: 10000 })
})

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

