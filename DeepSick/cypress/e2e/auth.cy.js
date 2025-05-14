// End-to-end tests for authentication functionality

describe('Authentication Flow', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('allows users to register a new account', () => {
    // Visit registration page
    cy.visit('/register');
    
    // Generate random username and email to avoid duplicates
    const randomNum = Math.floor(Math.random() * 10000);
    const username = `testuser${randomNum}`;
    const email = `testuser${randomNum}@example.com`;
    
    // Fill registration form
    cy.get('[data-testid="username-input"]').type(username);
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type('Test@123');
    cy.get('[data-testid="confirm-password-input"]').type('Test@123');
    
    // Submit form
    cy.get('[data-testid="register-button"]').click();
    
    // Verify successful registration and redirect to welcome page
    cy.url().should('include', '/welcome');
    
    // Verify token is saved to localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.exist;
    });
  });

  it('allows users to log in', () => {
    // Visit login page
    cy.visit('/login');
    
    // Fill login form (using preset user)
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('testpassword123');
    
    // Submit form
    cy.get('[data-testid="login-button"]').click();
    
    // Verify successful login and redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Check that user menu is displayed
    cy.get('[data-testid="user-menu"]').should('exist');
    
    // Verify token is stored in localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.exist;
    });
  });

  it('fails to log in with incorrect credentials', () => {
    // Visit login page
    cy.visit('/login');
    
    // Fill incorrect login information
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    
    // Submit form
    cy.get('[data-testid="login-button"]').click();
    
    // Verify error message is displayed
    cy.get('[data-testid="login-error"]').should('be.visible');
    cy.get('[data-testid="login-error"]').should('contain', 'Email or password is incorrect');
    
    // Verify URL remains on login page
    cy.url().should('include', '/login');
  });

  it('allows users to log out', () => {
    // Log in first
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('testpassword123');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for login to complete
    cy.url().should('include', '/dashboard');
    
    // Click user menu
    cy.get('[data-testid="user-menu"]').click();
    
    // Click logout button
    cy.get('[data-testid="logout-button"]').click();
    
    // Verify redirect to login page
    cy.url().should('include', '/login');
    
    // Verify token is removed from localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.be.null;
    });
  });

  it('redirects unauthenticated users to login page when accessing protected pages', () => {
    // Try to access protected page directly
    cy.visit('/dashboard');
    
    // Should be redirected to login page
    cy.url().should('include', '/login');
    
    // Should display notification that login is required
    cy.get('[data-testid="auth-required-message"]').should('be.visible');
  });
}); 