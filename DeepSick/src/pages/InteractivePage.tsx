// src/pages/InteractivePage.tsx
// Enhanced Interactive page with room listing functionality

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import InteractionSection from '../components/interactive/InteractionSection';
import {
  FuneralRoom,
  getAllFuneralRooms,
  getFuneralRoomById,
  verifyRoomPassword
} from '../services/funeralRoomDatabase';
import { ChatBox } from '../components/ChatBox';
import '../App.css';
import './InteractivePage.css';
import DreamShrink from '../components/DreamList/DreamShrink';

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

// A utility for converting the FuneralRoom type to the RoomData type
const convertToRoomData = (funeralRoom: FuneralRoom) => {
  return {
    roomId: funeralRoom.roomId,
    password: funeralRoom.password || '',
    funeralType: funeralRoom.funeralType,
    backgroundImage: funeralRoom.backgroundImage,
    name: funeralRoom.deceasedName,
    deceasedImage: funeralRoom.deceasedImage
  };
};

// Cache validity period (milliseconds)
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5分钟

//Main page component
const InteractivePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();

  //Room data status
  const [currentRoom, setCurrentRoom] = useState<FuneralRoom | null>(null);
  const [allRooms, setAllRooms] = useState<FuneralRoom[]>([]);
  const [isLoadingCurrentRoom, setIsLoadingCurrentRoom] = useState(true);
  const [isLoadingAllRooms, setIsLoadingAllRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomNotFound, setRoomNotFound] = useState<boolean>(false);

  // Cache status
  const [roomsCache, setRoomsCache] = useState<{
    data: FuneralRoom[];
    timestamp: number;
  } | null>(null);

  // The state of the password modal box
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoomForPassword, setSelectedRoomForPassword] = useState<FuneralRoom | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Obtain all room functions - Use caching to avoid frequent API calls
  const fetchAllRooms = useCallback(async (forceRefresh: boolean = false) => {

    if (
      roomsCache &&
      !forceRefresh &&
      Date.now() - roomsCache.timestamp < CACHE_EXPIRY_TIME
    ) {
      setAllRooms(roomsCache.data);
      setIsLoadingAllRooms(false);
      return roomsCache.data;
    }


    setIsLoadingAllRooms(true);

    try {
      const rooms = await getAllFuneralRooms();

      // Update the cache and status
      setRoomsCache({
        data: rooms,
        timestamp: Date.now()
      });
      setAllRooms(rooms);
      setError(null);
      setIsLoadingAllRooms(false);
      return rooms;
    } catch (err) {
      console.error('Error loading all rooms:', err);
      setError('Failed to load room list. Please try again.');
      setIsLoadingAllRooms(false);
      return [];
    }
  }, [roomsCache]);

  // Load a specific room based on the ID
  const loadRoomById = useCallback(async (roomId: string, cachedRooms: FuneralRoom[]) => {
    setIsLoadingCurrentRoom(true);
    setRoomNotFound(false);

    try {
      // First, try to search from the cached list of rooms
      const cachedRoom = cachedRooms.find(room => room.roomId === roomId);
      if (cachedRoom) {
        setCurrentRoom(cachedRoom);
        setIsLoadingCurrentRoom(false);
        return;
      }

      // If it is not in the cache, obtain it from the API
      const roomData = await getFuneralRoomById(roomId);
      if (roomData) {
        setCurrentRoom(roomData);
        setError(null);
      } else {
        setRoomNotFound(true);
        setError(`Room with ID "${roomId}" not found.`);
      }
    } catch (err) {
      console.error(`Error loading room ${roomId}:`, err);
      setError(`Failed to load room data for ${roomId}. Please try again.`);
      setRoomNotFound(true);
    } finally {
      setIsLoadingCurrentRoom(false);
    }
  }, []);

  // Initialize data - Load the room from the URL or location state
  useEffect(() => {
    const initializeData = async () => {

      const rooms = await fetchAllRooms();


      const stateData = location.state as FuneralRoom;

      if (stateData && stateData.roomId) {

        setCurrentRoom(stateData);
        setIsLoadingCurrentRoom(false);
      } else if (urlRoomId) {

        await loadRoomById(urlRoomId, rooms);
      } else {

        setIsLoadingCurrentRoom(false);
      }
    };

    initializeData();
  }, [location, urlRoomId, fetchAllRooms, loadRoomById]);

  // Handle the selection of rooms from the RoomList
  const handleRoomSelect = (room: FuneralRoom) => {
    setSelectedRoomForPassword(room);
    setShowPasswordModal(true);
    setPasswordError(null);
  };

  // Handle the shortcuts for switching to other rooms
  const switchRoom = (roomId: string) => {
    const targetRoom = allRooms.find(room => room.roomId === roomId);
    if (targetRoom) {
      handleRoomSelect(targetRoom);
    }
  };


  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setSelectedRoomForPassword(null);
    setPasswordError(null);
  };

  // Handle password submission
  const handlePasswordSubmit = async (password: string) => {
    if (!selectedRoomForPassword) return;

    try {
      const isValid = await verifyRoomPassword(selectedRoomForPassword.roomId, password);

      if (isValid) {

        setShowPasswordModal(false);


        const roomWithPassword = {
          ...selectedRoomForPassword,
          password
        };
        setCurrentRoom(roomWithPassword);


        navigate(`/interactive/${selectedRoomForPassword.roomId}`, {
          replace: true,
          state: roomWithPassword
        });


        setError(null);
        setRoomNotFound(false);
      } else {
        setPasswordError('Invalid password. Please try again.');
      }
    } catch (err) {
      console.error('Failed to verify password:', err);
      setPasswordError('An error occurred. Please try again.');
    }
  };

  // Handle refreshing the room list
  const handleRefreshRooms = () => {
    fetchAllRooms(true); // 强制刷新
  };


  if (isLoadingCurrentRoom) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room data...</p>
      </div>
    );
  }

  return (
    <div className="interactive-page">

      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/funeralhall" className="breadcrumb-link">Funeral Hall</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {currentRoom ? `${currentRoom.deceasedName}'s Memorial` : 'Interactive Page'}
        </span>
      </nav>


      {error && (
        <div className="error-notification">
          <p>{error}</p>
          {roomNotFound && (
            <button
              className="action-button"
              onClick={() => navigate('/interactive')}
            >
              Back to Memorial Hall
            </button>
          )}
        </div>
      )}


      {currentRoom ? (
        <>
          {/* Room Information Area */}
          <section className="hero-section">
            <div className="hero-image-container">
              <img
                src={currentRoom.deceasedImage || currentRoom.backgroundImage}
                alt={currentRoom.deceasedName}
                className="hero-image"
              />
            </div>
            <h1 className="hero-name">{currentRoom.deceasedName}</h1>
            <p className="hero-subtitle">Room ID: {currentRoom.roomId}</p>
          </section>

          {/* Interactive function area - Now includes a drawing board and a music player */}
          <InteractionSection roomData={convertToRoomData(currentRoom)} />
        </>
      ) : (

        <div className="welcome-section">
          <h1>Welcome to the Funeral Memorial Hall</h1>
          <p>Please select a room below to enter and pay your respects</p>
        </div>
      )}

      <div className="dream-shrink-fixed">
        <DreamShrink />
      </div>

      {/* Password modal box*/}
      <PasswordModal
        show={showPasswordModal}
        roomId={selectedRoomForPassword?.roomId || ''}
        onClose={handleCloseModal}
        onSubmit={handlePasswordSubmit}
        error={passwordError || undefined}
      />
    </div>
  );
};

export default InteractivePage;