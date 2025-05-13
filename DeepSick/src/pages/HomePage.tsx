import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import homeVideo from '../assets/Home.mp4';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if user is authenticated
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userType = userStr ? JSON.parse(userStr).userType : null;
    
    // If visitor is logged in, redirect to funeral hall
    if (userType === 'visitor') {
      navigate('/funeralhall');
    }
  }, [navigate]);
  
  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1 className="title">Digital Memorial Hall</h1>
        <h2 className="subtitle">Remember and Honor</h2>
        
        {/* Video animation in the center */}
        <div className="animation-container">
          <video 
            className="home-video" 
            autoPlay 
            loop 
            muted 
            playsInline
            src={homeVideo}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="navigation-buttons">
          <Link to="/interactive" className="nav-button">Interactive</Link>
          <Link to="/hall" className="nav-button">Memorial Hall</Link>
          <Link to="/funeralhall" className="nav-button primary">Funeral Rooms</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 