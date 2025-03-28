import React from 'react'
import EventsPage from './page'

describe('<EventsPage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<EventsPage />)
  })
})