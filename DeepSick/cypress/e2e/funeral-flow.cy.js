// End-to-end tests for funeral ceremony creation flow

describe('Funeral Ceremony Flow', () => {
  // Login helper function
  const login = () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('organizer@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  };

  beforeEach(() => {
    // Login before each test
    login();
  });

  it('allows organizers to create a new funeral ceremony', () => {
    // Navigate to create funeral page
    cy.get('[data-testid="create-funeral-button"]').click();
    
    // Verify URL
    cy.url().should('include', '/funerals/create');
    
    // Fill basic information
    const funeralTitle = `Test Funeral Ceremony ${Date.now()}`;
    cy.get('[data-testid="funeral-title-input"]').type(funeralTitle);
    
    // Select scene type
    cy.get('[data-testid="scene-selection"]').click();
    cy.get('[data-testid="scene-option-church"]').click();
    
    // Click next step
    cy.get('[data-testid="next-step-button"]').click();
    
    // Add deceased information
    cy.get('[data-testid="deceased-name-input"]').type('Test Deceased');
    cy.get('[data-testid="deceased-birth-date-input"]').type('1950-01-01');
    cy.get('[data-testid="deceased-death-date-input"]').type('2023-01-01');
    
    // Upload deceased photo (skip actual upload, just verify presence)
    cy.get('[data-testid="upload-photo-button"]').should('exist');
    
    // Click next step
    cy.get('[data-testid="next-step-button"]').click();
    
    // Add ceremony steps
    // Add welcome step
    cy.get('[data-testid="add-step-button"]').click();
    cy.get('[data-testid="step-type-welcome"]').click();
    cy.get('[data-testid="step-title-input"]').type('Welcome');
    cy.get('[data-testid="step-description-input"]').type('Welcome to the ceremony');
    cy.get('[data-testid="save-step-button"]').click();
    
    // Add eulogy step
    cy.get('[data-testid="add-step-button"]').click();
    cy.get('[data-testid="step-type-eulogy"]').click();
    cy.get('[data-testid="step-title-input"]').type('Eulogy');
    cy.get('[data-testid="step-description-input"]').type('This is a test eulogy content.');
    cy.get('[data-testid="save-step-button"]').click();
    
    // Submit creation
    cy.get('[data-testid="create-funeral-submit"]').click();
    
    // Verify redirect to preview page
    cy.url().should('include', '/funerals/preview');
    
    // Verify title displays correctly
    cy.get('[data-testid="funeral-title"]').should('contain', funeralTitle);
    
    // Confirm creation
    cy.get('[data-testid="confirm-creation-button"]').click();
    
    // Verify redirect to detail page
    cy.url().should('include', '/funerals/detail');
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('allows participants to join a funeral ceremony and interact', () => {
    // Navigate to funeral list
    cy.visit('/funerals');
    
    // Select first funeral
    cy.get('[data-testid="funeral-card"]').first().click();
    
    // Verify entering detail page
    cy.url().should('include', '/funerals/detail');
    
    // Click join ceremony button
    cy.get('[data-testid="join-ceremony-button"]').click();
    
    // Verify entering ceremony page
    cy.url().should('include', '/ceremony');
    
    // Verify ceremony interface elements
    cy.get('[data-testid="ceremony-scene"]').should('exist');
    cy.get('[data-testid="steps-timeline"]').should('exist');
    cy.get('[data-testid="chat-box"]').should('exist');
    
    // Send message in chat box
    cy.get('[data-testid="chat-input"]').type('This is a test message{enter}');
    
    // Verify message appears in chat list
    cy.get('[data-testid="chat-messages"]').should('contain', 'This is a test message');
    
    // Click first ceremony step
    cy.get('[data-testid="ceremony-step"]').first().click();
    
    // Verify step content is displayed
    cy.get('[data-testid="step-content"]').should('be.visible');
  });

  it('allows organizers to edit existing funeral ceremonies', () => {
    // Navigate to funeral list
    cy.visit('/funerals');
    
    // Select edit button on first funeral
    cy.get('[data-testid="funeral-card"]').first()
      .find('[data-testid="edit-funeral-button"]').click();
    
    // Verify entering edit page
    cy.url().should('include', '/funerals/edit');
    
    // Modify title
    const updatedTitle = `Updated Funeral Ceremony ${Date.now()}`;
    cy.get('[data-testid="funeral-title-input"]').clear().type(updatedTitle);
    
    // Save changes
    cy.get('[data-testid="save-changes-button"]').click();
    
    // Verify save success
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Verify title has been updated
    cy.get('[data-testid="funeral-title"]').should('contain', updatedTitle);
  });

  it('allows users to upload memorial photos', () => {
    // Navigate to funeral detail page
    cy.visit('/funerals');
    cy.get('[data-testid="funeral-card"]').first().click();
    
    // Click memorial photos tab
    cy.get('[data-testid="memorial-photos-tab"]').click();
    
    // Verify gallery loads
    cy.get('[data-testid="memorial-photos-gallery"]').should('exist');
    
    // Click upload button (skip actual upload, just verify)
    cy.get('[data-testid="upload-photo-button"]').should('exist');
    
    // Verify upload area exists
    cy.get('[data-testid="photo-upload-area"]').should('exist');
  });
}); 