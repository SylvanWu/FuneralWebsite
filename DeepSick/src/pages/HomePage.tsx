import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import homeVideo from '../assets/Home.mp4';
import Firework from '../components/effects/PixelExplosion';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [videoEnded, setVideoEnded] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [skipVideo, setSkipVideo] = useState(false);
  
  // Firework state
  const [explosion, setExplosion] = useState<{ x: number; y: number; show: boolean }>({ 
    x: 0, 
    y: 0, 
    show: false 
  });
  
  // Check if user is authenticated
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userType = userStr ? JSON.parse(userStr).userType : null;
    
    // If visitor is logged in, redirect to funeral hall
    if (userType === 'visitor') {
      navigate('/funeralhall');
    }
  }, [navigate]);

  // Handle video ended event
  const handleVideoEnded = () => {
    setVideoEnded(true);
    // Ensure video stays on last frame
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration;
    }
  };

  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsVideoLoading(false);
  };

  // Handle skip button click
  const handleSkip = () => {
    if (videoRef.current) {
      // Set video time to the last second
      videoRef.current.currentTime = videoRef.current.duration - 1;
      // Continue playing the last second
      videoRef.current.play();
    }
    setSkipVideo(true);
  };

  // Handle click for firework effect
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger fireworks after video has ended or been skipped
    if (videoEnded || skipVideo) {
      setExplosion({ 
        x: e.clientX, 
        y: e.clientY, 
        show: true 
      });
      
      // Reset firework after animation completes (1.3s = rocket + explosion)
      setTimeout(() => {
        setExplosion(prev => ({ ...prev, show: false }));
      }, 1300);
    }
  };

  // Preload video and setup video element
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      // Add event listeners for video loading
      videoElement.addEventListener('loadeddata', handleVideoLoaded);
      
      // Set low quality for mobile devices to improve performance
      if (window.innerWidth <= 768) {
        videoElement.setAttribute('playsinline', '');
        
        // Check if the browser supports video preload control
        if ('connection' in navigator && (navigator as any).connection.saveData) {
          // For devices on data-saver mode
          videoElement.preload = 'metadata';
        } else {
          videoElement.preload = 'auto';
        }
      }
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadeddata', handleVideoLoaded);
      }
    };
  }, []);
  
  return (
    <div className="fullscreen-container" onClick={handleClick}>
      {isVideoLoading && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
          <p>Loading experience...</p>
        </div>
      )}
      
      <div className="skip-button-container">
        <button 
          className="skip-button"
          onClick={handleSkip}
        >
          Skip
        </button>
      </div>
      
      <div className="video-container">
        <video 
          ref={videoRef}
          className="fullscreen-video" 
          autoPlay 
          muted 
          playsInline
          src={homeVideo}
          onLoadedData={handleVideoLoaded}
          onEnded={handleVideoEnded}
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      {(videoEnded || skipVideo) && (
        <div className="auth-buttons-container">
          <h1 className="app-title">Digital Memorial Hall</h1>
          <p className="app-subtitle">Remember and Honor</p>
          <div className="auth-buttons">
            <Link to="/login" className="auth-button login-button">Login</Link>
            <Link to="/register" className="auth-button register-button">Register</Link>
          </div>
        </div>
      )}
      
      {/* Firework animation */}
      <Firework 
        x={explosion.x} 
        y={explosion.y} 
        show={explosion.show} 
      />
    </div>
  );
};

export default HomePage; 