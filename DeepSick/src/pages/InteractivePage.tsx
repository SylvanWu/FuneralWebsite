// src/pages/InteractivePage.tsx
// Interactive page: hero image + basic info + three interaction cards

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SharedCanvas from '../components/SharedCanvas';
import MusicPlayer from '../components/MusicPlayer';
import '../App.css';
import './InteractivePage.css';

// Props for interaction cards
interface InteractionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

// Room data interface
interface RoomData {
  roomId: string;
  password: string;
  funeralType: string;
  backgroundImage: string;
  name: string;
  deceasedImage?: string;
}

// Interaction card component
const InteractionCard: React.FC<InteractionCardProps> = ({ icon, title, description, onClick }) => (
  <div className="interactive-card" onClick={onClick}>
    <div className="icon">{icon}</div>
    <h3 className="title">{title}</h3>
    <p className="description">{description}</p>
    <button className="action-button">Click to {title.toLowerCase()}</button>
  </div>
);

// Main interactive page component
const InteractivePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  // Get room data from location state
  useEffect(() => {
    const state = location.state as RoomData;
    if (state) {
      setRoomData(state);
    } else {
      // If no room data, redirect to funeral hall
      navigate('/funeralhall');
    }
  }, [location, navigate]);

  if (!roomData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room data...</p>
      </div>
    );
  }

  return (
    <div className="interactive-page">
      {/* Hero section */}
      <section className="hero-section">
        <div
          style={{
            width: '100%',
            maxWidth: '900px',
            height: 'auto',
            maxHeight: '800px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <img
            src={roomData.deceasedImage || roomData.backgroundImage}
            alt={roomData.name}
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>
        <h1 className="hero-name">{roomData.name}</h1>
        <p className="hero-subtitle">Room ID: {roomData.roomId}</p>
      </section>

      {/* Music Player */}
      <section className="music-section">
        <h2>Memorial Music</h2>
        <MusicPlayer />
      </section>

      {/* Drawing canvas */}
      <section className="drawing-area">
        <h2>Collaborative Drawing Board</h2>
        <SharedCanvas />
      </section>

      {/* Interaction cards */}
      <section className="cards-section">
        <InteractionCard
          icon={<span role="img" aria-label="flower">💐</span>}
          title="Lay Flowers"
          description="Send flowers in honor of the departed"
          onClick={() => navigate('/flower', { state: roomData })}
        />
        <InteractionCard
          icon={<span role="img" aria-label="candle">🕯️</span>}
          title="Light a Candle"
          description="Light a candle for the departed"
          onClick={() => navigate('/candle', { state: roomData })}
        />
        <InteractionCard
          icon={<span role="img" aria-label="message">💬</span>}
          title="Leave a Message"
          description="Leave your blessings and remembrances"
          onClick={() => navigate('/message', { state: roomData })}
        />
      </section>
    </div>
  );
};

export default InteractivePage;
