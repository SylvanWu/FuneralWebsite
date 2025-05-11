import React, { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

interface MusicPlayerProps {
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isRandom, setIsRandom] = useState(false);
  const [playlist, setPlaylist] = useState<File[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (playlist.length > 0 && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(playlist[currentTrackIndex]);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
    // eslint-disable-next-line
  }, [currentTrackIndex, playlist]);

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
    setPlaylist(prev => [...prev, ...audioFiles]);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isRandom) {
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
    if (isRandom) {
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`music-player ${className || ''}`}>
      <div className="player-controls">
        <button onClick={handlePrevious} className="control-button">
          ⏮️
        </button>
        <button onClick={handlePlayPause} className="control-button">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={handleNext} className="control-button">
          ⏭️
        </button>
        <button 
          onClick={() => setIsRandom(!isRandom)} 
          className={`control-button ${isRandom ? 'active' : ''}`}
        >
          🔀
        </button>
      </div>

      <div className="progress-bar">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="progress"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      <div className="volume-control">
        <span>🔈</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume"
        />
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
          上传音乐
        </button>
      </div>

      {/* 音乐列表 */}
      {playlist.length > 0 && (
        <div className="playlist-section">
          <ul className="playlist-list">
            {playlist.map((file, idx) => (
              <li
                key={idx}
                className={`playlist-item${idx === currentTrackIndex ? ' active' : ''}`}
                onClick={() => handleSelectTrack(idx)}
                title={file.name}
              >
                {idx === currentTrackIndex ? '▶️ ' : ''}{file.name}
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