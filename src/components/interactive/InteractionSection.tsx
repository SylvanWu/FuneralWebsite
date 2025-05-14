import React, { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import WillForm from '../WillForm';
import WillList from '../WillList';
import type { Will } from '../../types';

// Debug component
interface UserDebugProps {
  roomData: {
    roomId: string;
    isOrganizer?: boolean;
  };
}

const UserDebug = ({ roomData }: UserDebugProps) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  return (
    <div style={{padding: '10px', background: '#f5f5f5', margin: '10px 0', 
                 border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px'}}>
      <h4 style={{margin: '0 0 5px 0'}}>Debug Info</h4>
      <div><strong>Room Data:</strong> roomId={roomData.roomId}</div>
      <div><strong>User Info:</strong> userId={user._id}, userType={user.userType}</div>
      <div><strong>Token:</strong> {token ? `${token.substring(0, 15)}...` : 'None'}</div>
      
      <div style={{marginTop: '5px'}}>
        <button 
          onClick={() => console.log('Room data:', roomData)} 
          style={{padding: '2px 6px', background: '#e0e0e0', border: '1px solid #ccc', borderRadius: '3px', marginRight: '5px'}}
        >
          Print Room Data
        </button>
        <button 
          onClick={() => console.log('User data:', user)} 
          style={{padding: '2px 6px', background: '#e0e0e0', border: '1px solid #ccc', borderRadius: '3px'}}
        >
          Print User Data
        </button>
      </div>
    </div>
  );
};

// Types
interface InteractionSectionProps {
  roomData: {
    roomId: string;
    isOrganizer?: boolean;
  };
  className?: string;
  onWillSuccessfullyCreated?: (will: Will) => void;
  wills?: Will[];
  isLoadingWills?: boolean;
  onDeleteWill?: (id: string) => void;
  onUpdateWill?: (id: string, data: any, videoBlob?: Blob) => void;
  isOrganizer?: boolean;
}

// Main interaction section component
const InteractionSection = ({
  roomData,
  className = '',
  onWillSuccessfullyCreated,
  wills = [],
  isLoadingWills = false,
  onDeleteWill,
  onUpdateWill,
  isOrganizer = false
}: InteractionSectionProps) => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState('interact');

  // All users have the same permissions now
  
  // Handle successful will creation
  const handleLocalWillCreated = (newWill: Will) => {
    onWillSuccessfullyCreated?.(newWill);
  };

  return (
    <div className={`${className} interaction-section`}>
      <div className="tab-container">
        <button
          className={`tab-button ${activeTabId === 'interact' ? 'active' : ''}`}
          onClick={() => setActiveTabId('interact')}
        >
          Interact
        </button>
        <button
          className={`tab-button ${activeTabId === 'will' ? 'active' : ''}`}
          onClick={() => setActiveTabId('will')}
        >
          Farewell Messages
        </button>
      </div>

      {activeTabId === 'will' && (
        <div className="tab-content will-container">
          <div className="will-wrapper">
            <h3>Farewell Messages</h3>
            <p className="will-description">
              Create video farewell messages or wills, share your memories and wishes
            </p>

            {/* Debug component */}
            <UserDebug roomData={roomData} />

            <div className="will-form-container">
              <WillForm
                roomId={roomData.roomId}
                onCreated={handleLocalWillCreated}
              />
            </div>

            <div className="will-list-section">
              <WillList
                wills={wills}
                onDelete={onDeleteWill}
                onUpdate={onUpdateWill}
              />
              {isLoadingWills && <div className="loading-spinner">Loading...</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionSection; 