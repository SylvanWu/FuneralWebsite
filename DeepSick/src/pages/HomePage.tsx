import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import homeVideo from '../assets/Home.mp4';

const HomePage: React.FC = () => {
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
          >
            <source src={homeVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="navigation-buttons">
          <Link to="/interactive" className="nav-button">Interactive</Link>
          <Link to="/hall" className="nav-button primary">Enter Memorial Hall</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 