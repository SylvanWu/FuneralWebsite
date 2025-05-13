import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFuneralRooms, FuneralRoom, verifyRoomPassword, getMockFuneralRooms } from '../services/funeralRoomDatabase';
import './FuneralRoomHallPage.css';
import axios from 'axios';

// Import background images for room cards
import churchImage from '../assets/funeral type/church funeral.png';
import gardenImage from '../assets/funeral type/garden funeral.png';
import forestImage from '../assets/funeral type/forest funeral.png';
import seasideImage from '../assets/funeral type/seaside funeral.png';
import starryNightImage from '../assets/funeral type/Starry Night Funeral.png';
import chineseTraditionalImage from '../assets/funeral type/Chinese traditional funeral.png';

// Background image mapping
const backgroundImageMap: Record<string, string> = {
  'church': churchImage,
  'garden': gardenImage,
  'forest': forestImage,
  'seaside': seasideImage,
  'starryNight': starryNightImage,
  'chineseTraditional': chineseTraditionalImage,
};

// Room card component props
interface RoomCardProps {
  room: FuneralRoom;
  onClick: (room: FuneralRoom) => void;
}

// Room card component
const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  // Get the appropriate background image
  const backgroundImage = room.deceasedImage || backgroundImageMap[room.funeralType] || churchImage;
  
  return (
    <div className="room-card" onClick={() => onClick(room)}>
      <div className="room-card-image">
        <img src={backgroundImage} alt={room.deceasedName} />
      </div>
      <div className="room-card-info">
        <h3 className="room-card-name">{room.deceasedName}</h3>
        <p className="room-card-id">Room ID: {room.roomId}</p>
      </div>
    </div>
  );
};

// Search box component props
interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// Search box component
const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, placeholder = "Search by room ID or name..." }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <div className="search-box-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

// Password modal component props
interface PasswordModalProps {
  show: boolean;
  roomId: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string;
}

// Password modal component
const PasswordModal: React.FC<PasswordModalProps> = ({ 
  show, roomId, onClose, onSubmit, error 
}) => {
  const [password, setPassword] = useState('');
  
  // Reset password when modal is opened/closed
  useEffect(() => {
    if (show) {
      setPassword('');
    }
  }, [show]);
  
  if (!show) return null;
  
  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="password-modal-header">
          <h2>Enter Room Password</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="password-modal-body">
          <p>Please enter the password for room {roomId}</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="password-modal-footer">
          <button 
            className="cancel-btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="submit-btn" 
            onClick={() => onSubmit(password)}
            disabled={!password}
          >
            Enter Room
          </button>
        </div>
      </div>
    </div>
  );
};

// Main funeral room hall page
const FuneralRoomHallPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<FuneralRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<FuneralRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<FuneralRoom | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);
  
  // Check server status first
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Attempt to connect to the server without authentication
        await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
        setServerStatus('online');
      } catch (error) {
        console.error('Server health check failed:', error);
        setServerStatus('offline');
        setDebugInfo(`Server connection error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    checkServerStatus();
  }, []);
  
  // Fetch all funeral rooms on component mount and when server is online
  useEffect(() => {
    if (serverStatus !== 'online') return;
    
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        // Debug log 
        console.log('Fetching funeral rooms...');
        console.log('API URL:', 'http://localhost:5001/api/funerals/rooms');
        
        const rooms = await getAllFuneralRooms();
        console.log('Rooms data received:', rooms);
        
        setRooms(rooms);
        setFilteredRooms(rooms); // Initialize filtered rooms with all rooms
        setError(null);
        setDebugInfo(null);
      } catch (err: any) {
        console.error('Failed to fetch funeral rooms:', err);
        setError('Failed to load funeral rooms. Please try again later.');
        setDebugInfo(`Error: ${err?.message || 'Unknown error'}. Status: ${err?.response?.status || 'N/A'}. Response: ${JSON.stringify(err?.response?.data || {})}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRooms();
  }, [serverStatus]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchPerformed(true);
    
    if (!query.trim()) {
      // If search is empty, show all rooms
      setFilteredRooms(rooms);
      return;
    }
    
    const normalizedQuery = query.trim().toLowerCase();
    
    // Filter rooms by ID or name containing the query
    const filtered = rooms.filter(room => 
      room.roomId.toLowerCase().includes(normalizedQuery) || 
      room.deceasedName.toLowerCase().includes(normalizedQuery)
    );
    
    setFilteredRooms(filtered);
  };
  
  // Reset search
  const resetSearch = () => {
    setFilteredRooms(rooms);
    setSearchPerformed(false);
  };
  
  // Handle room card click
  const handleRoomClick = (room: FuneralRoom) => {
    setSelectedRoom(room);
    setShowModal(true);
    setPasswordError(null);
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setPasswordError(null);
  };
  
  // Handle password submit
  const handlePasswordSubmit = async (password: string) => {
    if (!selectedRoom) return;
    
    try {
      const isValid = await verifyRoomPassword(selectedRoom.roomId, password);
      
      if (isValid) {
        // Close modal
        setShowModal(false);
        
        // 更新为直接导航到带有roomId参数的路由
        navigate(`/interactive/${selectedRoom.roomId}`, {
          state: {
            roomId: selectedRoom.roomId,
            password,
            funeralType: selectedRoom.funeralType,
            backgroundImage: selectedRoom.backgroundImage,
            name: selectedRoom.deceasedName,
            deceasedImage: selectedRoom.deceasedImage
          }
        });
      } else {
        setPasswordError('Invalid password. Please try again.');
      }
    } catch (err) {
      console.error('Failed to verify password:', err);
      setPasswordError('An error occurred. Please try again.');
    }
  };
  
  // Force reload data
  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // Check server status again
      try {
        await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
        throw new Error(`Server is offline: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // If server is online, fetch rooms
      const rooms = await getAllFuneralRooms();
      setRooms(rooms);
      setFilteredRooms(rooms);
      setSearchPerformed(false);
    } catch (err: any) {
      console.error('Failed to fetch funeral rooms on retry:', err);
      setError(`Failed to load funeral rooms: ${err?.message || 'Unknown error'}`);
      setDebugInfo(`Error: ${err?.message || 'Unknown error'}. Status: ${err?.response?.status || 'N/A'}. Response: ${JSON.stringify(err?.response?.data || {})}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock data creation for testing UI without backend
  const createMockData = () => {
    // Use the mock data from the service
    const mockRooms = getMockFuneralRooms();
    
    setRooms(mockRooms);
    setFilteredRooms(mockRooms);
    setIsLoading(false);
    setError(null);
    setServerStatus('online'); // Pretend we're connected
    setDebugInfo('Using mock data for testing. For testing purposes, use password: "password1" for room1, "password2" for room2, etc.');
    setSearchPerformed(false);
  };
  
  return (
    <div className="funeral-hall-container">
      <div className="funeral-hall-header">
        <h1>Funeral Room Hall</h1>
        <p>Click on a room to enter and pay respects</p>
      </div>
      
      {/* Search Box - show only when rooms are loaded */}
      {!isLoading && !error && serverStatus === 'online' && rooms.length > 0 && (
        <div className="search-section">
          <SearchBox onSearch={handleSearch} placeholder="Search by room ID or name..." />
          {searchPerformed && (
            <div className="search-results-info">
              <span>
                {filteredRooms.length === 0 
                  ? 'No rooms found matching your search' 
                  : `Found ${filteredRooms.length} room${filteredRooms.length !== 1 ? 's' : ''} matching your search`}
              </span>
              <button className="reset-search-btn" onClick={resetSearch}>
                Show All Rooms
              </button>
            </div>
          )}
        </div>
      )}
      
      {serverStatus === 'checking' ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking server status...</p>
        </div>
      ) : serverStatus === 'offline' ? (
        <div className="error-container">
          <p className="error-message">The server appears to be offline or unreachable.</p>
          <div className="debug-info">
            <p>Debug information:</p>
            <pre>{debugInfo}</pre>
          </div>
          <div className="mock-button-container">
            <p>You can continue testing with mock data:</p>
            <button 
              onClick={createMockData}
              className="mock-button large"
            >
              Load Mock Data
            </button>
          </div>
          <div className="button-group">
            <button 
              onClick={handleRetry}
              className="retry-button"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading funeral rooms...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          {debugInfo && (
            <div className="debug-info">
              <p>Debug information:</p>
              <pre>{debugInfo}</pre>
            </div>
          )}
          <div className="mock-button-container">
            <p>You can continue testing with mock data:</p>
            <button 
              onClick={createMockData}
              className="mock-button large"
            >
              Load Mock Data
            </button>
          </div>
          <div className="button-group">
            <button 
              onClick={handleRetry}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="room-grid">
          {filteredRooms.length === 0 ? (
            searchPerformed ? (
              <div className="no-rooms-message">
                <p>No rooms match your search criteria.</p>
                <button 
                  onClick={resetSearch}
                  className="retry-button"
                >
                  Show All Rooms
                </button>
              </div>
            ) : (
              <div className="no-rooms-message">
                <p>No funeral rooms available.</p>
                <div className="mock-button-container">
                  <p>Click below to load sample funeral rooms for testing:</p>
                  <button 
                    onClick={createMockData}
                    className="mock-button large"
                  >
                    Load Mock Data
                  </button>
                </div>
              </div>
            )
          ) : (
            filteredRooms.map((room) => (
              <RoomCard 
                key={room.roomId} 
                room={room} 
                onClick={handleRoomClick}
              />
            ))
          )}
        </div>
      )}
      
      {debugInfo && rooms.length > 0 && (
        <div className="debug-info-footer">
          <pre>{debugInfo}</pre>
        </div>
      )}
      
      <PasswordModal
        show={showModal}
        roomId={selectedRoom?.roomId || ''}
        onClose={handleCloseModal}
        onSubmit={handlePasswordSubmit}
        error={passwordError || undefined}
      />
    </div>
  );
};

export default FuneralRoomHallPage; 