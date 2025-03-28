const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Add this to avoid failing on non-2xx status codes during development
    failOnStatusCode: false,
    // Increase timeout for slow operations
    defaultCommandTimeout: 10000,
    // Disable web security to avoid CORS issues
    chromeWebSecurity: false,
  },
})

