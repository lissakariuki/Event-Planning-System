/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mock user login
       * @example cy.loginMockUser()
       */
      loginMockUser(): Chainable<Element>
  
      /**
       * Custom command to create a test team
       * @example cy.createTestTeam('My Team')
       */
      createTestTeam(teamName?: string): Chainable<Element>
  
      /**
       * Custom command to navigate to events page
       * @example cy.navigateToEvents()
       */
      navigateToEvents(): Chainable<Element>
  
      /**
       * Custom command to navigate to tasks page
       * @example cy.navigateToTasks()
       */
      navigateToTasks(): Chainable<Element>
    }
  }
  
  