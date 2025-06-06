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
import MusicPlayer from '../components/MusicPlayer';
import { getWills, deleteWill, updateWill } from '../api';
import { Will } from '../components/WillForm';

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
    deceasedImage: funeralRoom.deceasedImage,
    funeralPicture: funeralRoom.funeralPicture
  };
};

// Cache validity period (milliseconds)
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

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

  // 添加遗嘱相关状态
  const [wills, setWills] = useState<Will[]>([]);
  const [isLoadingWills, setIsLoadingWills] = useState(false);

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
        // If no user object, try to get from role
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
    fetchAllRooms(true); // Force refresh
  };

  // 加载遗嘱数据
  const fetchWills = useCallback(async (roomId: string) => {
    if (!roomId) return;
    
    setIsLoadingWills(true);
    try {
      console.log('[InteractivePage] Fetching wills for roomId:', roomId);
      const result = await getWills(roomId);
      console.log('[InteractivePage] Fetched wills:', result);
      setWills(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('[InteractivePage] Failed to fetch wills:', error);
      setWills([]);
    } finally {
      setIsLoadingWills(false);
    }
  }, []);
  
  // 遗嘱数据处理函数
  const handleDeleteWill = async (willId: string) => {
    if (!currentRoom?.roomId) return;
    try {
      await deleteWill(willId);
      await fetchWills(currentRoom.roomId); // 重新加载数据
    } catch (error) {
      console.error('[InteractivePage] Failed to delete will:', error);
    }
  };
  
  const handleUpdateWill = async (
    willId: string,
    fields: Partial<Will>,
    videoBlob?: Blob,
  ) => {
    if (!currentRoom?.roomId) return;
    try {
      if (videoBlob) {
        const fd = new FormData();
        if (fields.uploaderName !== undefined) fd.append('uploaderName', fields.uploaderName);
        if (fields.farewellMessage !== undefined) fd.append('farewellMessage', fields.farewellMessage);
        fd.append('video', new File([videoBlob], 'farewell.webm', { type: 'video/webm' }));
        await updateWill(willId, fd, true);
      } else {
        await updateWill(willId, fields);
      }
      await fetchWills(currentRoom.roomId); // 重新加载数据
    } catch (error) {
      console.error('[InteractivePage] Failed to update will:', error);
    }
  };
  
  // 当成功创建遗嘱后的回调
  const handleWillCreated = useCallback(() => {
    if (currentRoom?.roomId) {
      console.log('[InteractivePage] Will created, refreshing wills for roomId:', currentRoom.roomId);
      fetchWills(currentRoom.roomId);
    }
  }, [currentRoom, fetchWills]);
  
  // 当当前房间变化时，加载该房间的遗嘱
  useEffect(() => {
    if (currentRoom?.roomId) {
      fetchWills(currentRoom.roomId);
    }
  }, [currentRoom, fetchWills]);

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
            <div className="hero-info">
              <h1 className="hero-name">{(currentRoom as any).deceasedName || (currentRoom as any).name}</h1>
              <p className="hero-subtitle">Room ID: {currentRoom.roomId}</p>
            </div>
            
            {/* Funeral Picture Display */}
            {currentRoom.funeralPicture && (
              <div className="funeral-picture-container">
                <h3 className="funeral-picture-title">Funeral Room Picture</h3>
                <img 
                  src={currentRoom.funeralPicture} 
                  alt="Funeral Room" 
                  className="funeral-picture-image"
                />
              </div>
            )}
          </section>

          {/* Interactive function area - Now includes a drawing board and a music player */}
          <InteractionSection 
            roomData={convertToRoomData(currentRoom)}
            wills={wills}
            isLoadingWills={isLoadingWills}
            onDeleteWill={handleDeleteWill}
            onUpdateWill={handleUpdateWill}
            onWillSuccessfullyCreated={handleWillCreated}
          />
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

      {/* Music Player at the bottom */}
      <MusicPlayer />
    </div>
  );
};

export default InteractivePage;