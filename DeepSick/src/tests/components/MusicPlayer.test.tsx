import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicPlayer from '../../components/MusicPlayer';

// Mock audio functionality
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useRef: () => ({
      current: {
        play: vi.fn(),
        pause: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
    })
  };
});

describe('MusicPlayer Component', () => {
  const mockSongs = [
    { id: '1', title: 'Test Song 1', artist: 'Artist 1', url: '/test1.mp3', cover: '/cover1.jpg' },
    { id: '2', title: 'Test Song 2', artist: 'Artist 2', url: '/test2.mp3', cover: '/cover2.jpg' }
  ];

  it('renders MusicPlayer component and song information correctly', () => {
    render(<MusicPlayer songs={mockSongs} />);
    
    // Check if first song info is rendered
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    
    // Check if playback control buttons exist
    expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
    expect(screen.getByTestId('prev-button')).toBeInTheDocument();
  });

  it('toggles play state when play/pause button is clicked', () => {
    render(<MusicPlayer songs={mockSongs} />);
    
    const playPauseButton = screen.getByTestId('play-pause-button');
    
    // Initial state should be paused
    expect(playPauseButton).toHaveAttribute('aria-label', 'Play');
    
    // Click to play
    fireEvent.click(playPauseButton);
    expect(playPauseButton).toHaveAttribute('aria-label', 'Pause');
    
    // Click again to pause
    fireEvent.click(playPauseButton);
    expect(playPauseButton).toHaveAttribute('aria-label', 'Play');
  });

  it('switches to next song when next button is clicked', () => {
    render(<MusicPlayer songs={mockSongs} />);
    
    // Initially should display the first song
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    
    // Click next button
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    // Should display the second song
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
  });

  it('switches to previous song when previous button is clicked', () => {
    render(<MusicPlayer songs={mockSongs} />);
    
    // First switch to the second song
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    
    // Click previous button
    const prevButton = screen.getByTestId('prev-button');
    fireEvent.click(prevButton);
    
    // Should go back to the first song
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
  });

  it('displays appropriate placeholder message when no songs are available', () => {
    render(<MusicPlayer songs={[]} />);
    
    // Check if no songs message is displayed
    expect(screen.getByText('No songs available to play')).toBeInTheDocument();
  });
}); 