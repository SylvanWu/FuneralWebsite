import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import homeVideo from '../assets/Home.mp4';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  
  return (
    <div className="fullscreen-container">
      <div className="video-container">
        <video 
          ref={videoRef}
          className="fullscreen-video" 
          autoPlay 
          muted 
          playsInline
          src={homeVideo}
          onEnded={handleVideoEnded}
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      {videoEnded && (
        <div className="auth-buttons-container">
          <h1 className="app-title">Digital Memorial Hall</h1>
          <p className="app-subtitle">Remember and Honor</p>
          <div className="auth-buttons">
            <Link to="/login" className="auth-button login-button">Login</Link>
            <Link to="/register" className="auth-button register-button">Register</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 