import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SceneCard, { SceneType } from './SceneCard';

describe('SceneCard Component', () => {
  const mockScene: SceneType = {
    id: 'test-scene',
    name: 'Test Scene',
    description: 'This is a test scene',
    imageUrl: '/test-image.jpg'
  };

  const mockOnSelect = vi.fn();

  it('renders scene card with correct information', () => {
    render(
      <SceneCard 
        scene={mockScene} 
        isSelected={false} 
        onSelect={mockOnSelect} 
      />
    );

    // Check if scene name and description are displayed
    expect(screen.getByText('Test Scene')).toBeInTheDocument();
    expect(screen.getByText('This is a test scene')).toBeInTheDocument();
    
    // Check if image is rendered with correct src and alt
    const image = screen.getByAltText('Test Scene') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('/test-image.jpg');
  });

  it('shows selected state when isSelected is true', () => {
    render(
      <SceneCard 
        scene={mockScene} 
        isSelected={true} 
        onSelect={mockOnSelect} 
      />
    );
    
    // Check for visual indication of selection (checking for the SVG icon)
    // This is a simplified check since we can't easily test for the actual checkmark icon
    expect(document.querySelector('.absolute.top-2.right-2')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(
      <SceneCard 
        scene={mockScene} 
        isSelected={false} 
        onSelect={mockOnSelect} 
      />
    );
    
    // Click the card
    const card = screen.getByText('Test Scene').closest('div');
    fireEvent.click(card!);
    
    // Check if onSelect was called with the scene
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockScene);
  });

  it('renders fallback when imageUrl is not provided', () => {
    const sceneWithoutImage = { ...mockScene, imageUrl: '' };
    
    render(
      <SceneCard 
        scene={sceneWithoutImage} 
        isSelected={false} 
        onSelect={mockOnSelect} 
      />
    );
    
    // Check that the fallback div is shown instead of an image
    expect(screen.queryByAltText('Test Scene')).not.toBeInTheDocument();
    expect(screen.getByText('Test Scene', { selector: '.bg-gray-200 span' })).toBeInTheDocument();
  });
}); 