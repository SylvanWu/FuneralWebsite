import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabSelector, { TabItem } from '../common/TabSelector';
import TabContent, { TabContentSection } from '../common/TabContent';
import MemorialHall from './MemorialHall';
import SharedCanvas from '../SharedCanvas';
import MusicPlayer from '../MusicPlayer';
import WillForm from '../WillForm';
import DreamShrink from '../DreamList/DreamShrink';
import './InteractionSection.css';

// Interface for room data
export interface RoomData {
  roomId: string;
  password: string;
  funeralType: string;
  backgroundImage: string;
  name: string;
  deceasedImage?: string;
}

// Props for interaction card
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

// Props for the interaction section
interface InteractionSectionProps {
  roomData: RoomData;
  className?: string;
}

// Main interaction section component
const InteractionSection: React.FC<InteractionSectionProps> = ({ roomData, className = '' }) => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState<string>('interact');

  // Tab items for the interaction types
  const tabs: TabItem[] = [
    {
      id: 'interact',
      label: 'Interactive Features',
      icon: <span role="img" aria-label="interactive">🔄</span>
    },
    {
      id: 'canvas',
      label: 'Drawing Canvas',
      icon: <span role="img" aria-label="canvas">🎨</span>
    },
    {
      id: 'music',
      label: 'Memorial Music',
      icon: <span role="img" aria-label="music">🎵</span>
    },
    {
      id: 'memorial',
      label: 'Memorial Hall',
      icon: <span role="img" aria-label="memorial">📸</span>
    },
    {
      id: 'will',
      label: 'Farewell Will',
      icon: <span role="img" aria-label="will">📜</span>
    },
    {
      id: 'dream',
      label: 'Dream List',
      icon: <span role="img" aria-label="dream">✨</span>
    }
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // Handle successful will creation
  const handleWillCreated = (will: any) => {
    console.log('Will created successfully:', will);
    // 可以添加提示或其他反馈
  };

  return (
    <div className={`interaction-section ${className}`}>
      <h2 className="section-title">Interactive Memorial Features</h2>
      
      {/* Tab selector */}
      <TabSelector 
        tabs={tabs} 
        activeTabId={activeTabId} 
        onChange={handleTabChange} 
      />
      
      {/* Tab content */}
      <TabContentSection activeTabId={activeTabId}>
        {/* Interactive cards */}
        <TabContent id="interact" className="interaction-cards">
          <div className="cards-grid">
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
          </div>
          <p className="interaction-note">
            Choose an interactive feature to pay your respects or share memories
          </p>
        </TabContent>
        
        {/* Drawing canvas - integrated SharedCanvas component */}
        <TabContent id="canvas" className="canvas-container">
          <div className="shared-canvas-wrapper">
            <h3>Collaborative Drawing Board</h3>
            <p className="canvas-description">
              Draw together with others to create a memorial illustration
            </p>
            <SharedCanvas roomId={roomData.roomId} />
          </div>
        </TabContent>
        
        {/* Music player - integrated MusicPlayer component */}
        <TabContent id="music" className="music-container">
          <div className="music-player-wrapper">
            <h3>Memorial Music</h3>
            <p className="music-description">
              Listen to or add music to honor the memory of the departed
            </p>
            <MusicPlayer className="embedded-player" />
          </div>
        </TabContent>
        
        {/* Memorial Hall tab content */}
        <TabContent id="memorial" className="memorial-container">
          <MemorialHall roomData={roomData} />
        </TabContent>

        {/* Farewell Will tab content */}
        <TabContent id="will" className="will-container">
          <div className="will-wrapper">
            <h3>Record Your Farewell Message</h3>
            <p className="will-description">
              Create a video farewell message or will to share your memories and wishes
            </p>
            <div className="will-form-container">
              <WillForm onCreated={handleWillCreated} />
            </div>
          </div>
        </TabContent>

        {/* Dream List tab content */}
        <TabContent id="dream" className="dream-container">
          <div className="dream-wrapper">
            <h3>Dream List</h3>
            <p className="dream-description">
              Add wishes and thoughts to create a memorial dream list
            </p>
            <div className="dream-list-container">
              <DreamShrink />
            </div>
          </div>
        </TabContent>
      </TabContentSection>
    </div>
  );
};

export default InteractionSection;