import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MusicPlayer.css';

interface MusicPlayerProps {
  className?: string;
  defaultMusic?: string;
}

type PlayMode = 'sequence' | 'single' | 'random';

const MusicPlayer: React.FC<MusicPlayerProps> = ({ className, defaultMusic }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playMode, setPlayMode] = useState<PlayMode>('sequence');
  const [playlist, setPlaylist] = useState<Array<{ file: File | null; url: string; name: string }>>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultMusic) {
      setPlaylist(prev => {
        const hasDefaultMusic = prev.some(track => track.url === defaultMusic);
        if (!hasDefaultMusic) {
          return [...prev, {
            file: null,
            url: defaultMusic,
            name: 'Remember Me (Coco)'
          }];
        }
        return prev;
      });
    }
  }, [defaultMusic]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, playbackRate]);

  useEffect(() => {
    if (playlist.length > 0 && audioRef.current) {
      const currentTrack = playlist[currentTrackIndex];
      audioRef.current.src = currentTrack.file ? URL.createObjectURL(currentTrack.file) : currentTrack.url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, playlist]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek({ target: { value: String(Math.max(0, currentTime - 5)) } } as any);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek({ target: { value: String(Math.min(duration, currentTime + 5)) } } as any);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime, duration]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    const newTracks = audioFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPlaylist(prev => [...prev, ...newTracks]);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (playMode === 'random') {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    
    let prevIndex;
    if (playMode === 'random') {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    }
    
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleRemoveTrack = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist[index].file === null) {
      return;
    }
    setPlaylist(prev => prev.filter((_, i) => i !== index));
    if (index === currentTrackIndex) {
      setCurrentTrackIndex(0);
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setCurrentTrackIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setIsDragging(false);
    
    const draggedIndex = currentTrackIndex;
    if (draggedIndex === targetIndex) return;
    
    const newPlaylist = [...playlist];
    const [draggedItem] = newPlaylist.splice(draggedIndex, 1);
    newPlaylist.splice(targetIndex, 0, draggedItem);
    
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(targetIndex);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'sequence':
        return '🔁';
      case 'single':
        return '🔂';
      case 'random':
        return '🔀';
      default:
        return '🔁';
    }
  };

  return (
    <div className={`music-player ${className || ''}`}>
      <div className="player-header">
        <h3>Music Player</h3>
      </div>

      <div className="player-controls">
        <button onClick={handlePrevious} className="control-button">
          ⏮️
        </button>
        <button onClick={handlePlayPause} className="control-button play-button">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={handleNext} className="control-button">
          ⏭️
        </button>
        <button 
          onClick={() => setPlayMode(prev => 
            prev === 'sequence' ? 'single' : 
            prev === 'single' ? 'random' : 'sequence'
          )} 
          className={`control-button ${playMode !== 'sequence' ? 'active' : ''}`}
          title={`Play Mode: ${
            playMode === 'sequence' ? 'Sequence' :
            playMode === 'single' ? 'Single' : 'Random'
          }`}
        >
          {getPlayModeIcon()}
        </button>
      </div>

      <div className="progress-container">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="progress-bar"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      <div className="player-settings">
        <div className="volume-container">
          <span>🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        <div className="playback-rate">
          <span>⏱️</span>
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="rate-select"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="upload-button"
        >
          Upload Music
        </button>
      </div>

      {playlist.length > 0 && (
        <div className="playlist-section">
          <h4>Playlist</h4>
          <ul className="playlist-list">
            {playlist.map((track, idx) => (
              <li
                key={idx}
                className={`playlist-item${idx === currentTrackIndex ? ' active' : ''}`}
                onClick={() => handleSelectTrack(idx)}
                draggable={!!track.file}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                title={track.name}
              >
                <span className="track-number">{idx + 1}</span>
                <span className="track-name">{track.name}</span>
                {track.file && (
                  <button
                    className="remove-track"
                    onClick={(e) => handleRemoveTrack(idx, e)}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />
    </div>
  );
};

export default MusicPlayer; 