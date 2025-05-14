// ***********************************************************
// This file can be considered a registration file where you can add all support files
// to add extra support for your tests. Cypress will automatically include this file
// when initializing the test run.
// ***********************************************************

// Import commands.js file (example)
// import './commands'

// Hide XHR requests to make test logs clearer
Cypress.Server.defaults({
  ignore: (xhr) => {
    // Handle all XHRs related to resource requests
    return true;
  },
});

// Add custom test commands (if needed)
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Register screenshot on failure
Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    // Additional logic can be added here for failures
    console.log(`Test failed: ${runnable.title}`);
  }
});

// Override default error behavior to prevent some errors from stopping tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing due to application errors
  // In some cases, you might want the test to fail
  return false;
});

// If using TypeScript, you can declare global types here
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//     }
//   }
// } 