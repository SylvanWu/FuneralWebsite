import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleProtected from '../../components/RoleProtected';

// Mock context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Import mocked useAuth
import { useAuth } from '../../context/AuthContext';

describe('RoleProtected Component', () => {
  const mockUseAuth = useAuth as jest.Mock;
  
  // Mock child component
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('displays child component when user has required role', () => {
    // Mock authenticated user with required role
    mockUseAuth.mockReturnValue({
      user: { role: 'admin' },
      isAuthenticated: true
    });
    
    render(<RoleProtected roles={['admin']}><TestComponent /></RoleProtected>);
    
    // Child component should be displayed
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
  
  it('does not display child component when user does not have required role', () => {
    // Mock authenticated user without required role
    mockUseAuth.mockReturnValue({
      user: { role: 'user' },
      isAuthenticated: true
    });
    
    render(<RoleProtected roles={['admin']}><TestComponent /></RoleProtected>);
    
    // Child component should not be displayed
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
  
  it('does not display child component when user is not authenticated', () => {
    // Mock unauthenticated user
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false
    });
    
    render(<RoleProtected roles={['admin']}><TestComponent /></RoleProtected>);
    
    // Child component should not be displayed
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
  
  it('supports multiple role checking', () => {
    // Mock user with one of the acceptable roles
    mockUseAuth.mockReturnValue({
      user: { role: 'editor' },
      isAuthenticated: true
    });
    
    render(<RoleProtected roles={['admin', 'editor']}><TestComponent /></RoleProtected>);
    
    // Child component should be displayed
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
  
  it('handles empty roles array correctly', () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { role: 'user' },
      isAuthenticated: true
    });
    
    render(<RoleProtected roles={[]}><TestComponent /></RoleProtected>);
    
    // When roles array is empty, content should not be displayed by default
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
}); 