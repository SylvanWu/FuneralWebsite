// src/pages/InteractivePage.tsx
// Interactive page: hero image + basic info + three interaction cards

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './InteractivePage.css';

// Props for interaction cards
interface InteractionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
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

  return (
    <div className="interactive-page">
      {/* Hero section */}
      <section className="hero-section">
        <img src="/image.png" alt="Memorial Hall" className="hero-image" />
        <h1 className="hero-name">NAME</h1>
        <p className="hero-subtitle">MOTTO</p>
      </section>

      {/* Interaction cards */}
      <section className="cards-section">
        <InteractionCard
          icon={<span role="img" aria-label="flower">💐</span>}
          title="Lay Flowers"
          description="Send flowers in honor of the departed"
          onClick={() => navigate('/flower')}
        />
        <InteractionCard
          icon={<span role="img" aria-label="candle">🕯️</span>}
          title="Light a Candle"
          description="Light a candle for the departed"
          onClick={() => navigate('/candle')}
        />
        <InteractionCard
          icon={<span role="img" aria-label="message">💬</span>}
          title="Leave a Message"
          description="Leave your blessings and remembrances"
          onClick={() => navigate('/message')}
        />
      </section>
    </div>
  );
};

export default InteractivePage;
