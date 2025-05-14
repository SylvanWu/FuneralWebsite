import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabSelector, { TabItem } from '../common/TabSelector';
import TabContent, { TabContentSection } from '../common/TabContent';
import MemorialHall from './MemorialHall';
import SharedCanvas from '../SharedCanvas';
import WillForm from '../WillForm';
import WillList from '../WillList';
import { Will } from '../WillForm';
import DreamShrink from '../DreamList/DreamShrink';
import { ChatBox } from '../ChatBox';
import './InteractionSection.css';

// Interface for room data
export interface RoomData {
  roomId: string;
  password: string;
  funeralType: string;
  backgroundImage: string;
  name: string;
  deceasedImage?: string;
  funeralPicture?: string;
  isOrganizer?: boolean;
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
  onWillSuccessfullyCreated?: () => void;
  wills?: Will[];
  isLoadingWills?: boolean;
  onDeleteWill?: (willId: string) => void;
  onUpdateWill?: (willId: string, fields: Partial<Will>, videoBlob?: Blob) => void;
  isOrganizer?: boolean;
}

// Main interaction section component
const InteractionSection: React.FC<InteractionSectionProps> = ({
  roomData,
  className = '',
  onWillSuccessfullyCreated,
  wills = [],
  isLoadingWills = false,
  onDeleteWill,
  onUpdateWill,
  isOrganizer = false
}) => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState<string>('interact');

  // 使用roomData中的isOrganizer值，而不是从props传入的
  const effectiveIsOrganizer = roomData.isOrganizer === true;

  // Add the debugging log
  console.log('[InteractionSection] Props:', {
    roomId: roomData.roomId,
    roomDataIsOrganizer: roomData.isOrganizer,
    propsIsOrganizer: isOrganizer,
    effectiveIsOrganizer,
    hasDeleteFunction: !!onDeleteWill,
    hasUpdateFunction: !!onUpdateWill,
    willsCount: wills.length
  });

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
      id: 'chat',
      label: 'Chat',
      icon: <span role="img" aria-label="chat">💬</span>
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

  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // Handle successful will creation
  const handleLocalWillCreated = (will: any) => {
    onWillSuccessfullyCreated?.();
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
        <TabContent id="interact" className="interaction-cards" activeId={activeTabId}>
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
        <TabContent id="canvas" className="canvas-container" activeId={activeTabId}>
          <div className="shared-canvas-wrapper">
            <h3>Collaborative Drawing Board</h3>
            <p className="canvas-description">
              Draw together with others to create a memorial illustration
            </p>
            <SharedCanvas roomId={roomData.roomId} />
          </div>
        </TabContent>

        {/* Chat section */}
        <TabContent id="chat" className="chat-container" activeId={activeTabId}>
          <div className="chat-wrapper">
            <h3>Live Chat</h3>
            <p className="chat-description">
              Chat with others in real-time
            </p>
            {(() => {
              const userStr = localStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : {};
              return (
                <ChatBox
                  roomId={roomData.roomId}
                  userId={user._id || 'anonymous'}
                  username={user.nickname || user.username || 'Guest'}
                />
              );
            })()}
          </div>
        </TabContent>

        {/* Memorial Hall tab content */}
        <TabContent id="memorial" className="memorial-container" activeId={activeTabId}>
          <MemorialHall roomData={roomData} />
        </TabContent>

        {/* Farewell Will tab content */}
        <TabContent id="will" className="will-container" activeId={activeTabId}>
          <div className="will-wrapper">
            <h3>Farewell Messages</h3>
            <p className="will-description">
              {effectiveIsOrganizer
                ? "Create video farewell messages or wills, share your memories and wishes"
                : "View farewell messages left by others"}
            </p>

            {effectiveIsOrganizer && (
              <div className="will-form-container">
                <WillForm
                  roomId={roomData.roomId}
                  onCreated={handleLocalWillCreated}
                />
              </div>
            )}

            <div className="mt-12 p-6 bg-gray-50 rounded-lg shadow">
              <h2 className="text-3xl font-bold text-center text-gray-700 mb-8">
                Farewell Messages for {roomData.name}
              </h2>

              {isLoadingWills ? (
                <div className="text-center py-4">
                  <div className="loading-spinner-small mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : wills.length > 0 ? (
                <WillList
                  wills={wills}
                  onDelete={effectiveIsOrganizer ? onDeleteWill : undefined}
                  onUpdate={effectiveIsOrganizer ? onUpdateWill : undefined}
                />
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No farewell messages in this room yet.
                </p>
              )}
            </div>
          </div>
        </TabContent>

        {/* Dream List tab content */}
        <TabContent id="dream" className="dream-container" activeId={activeTabId}>
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