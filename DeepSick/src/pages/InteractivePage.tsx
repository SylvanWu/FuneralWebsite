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
import WillForm from '../components/WillForm';
import WillList from '../components/WillList';
import { Will } from '../components/WillForm'; // Will 类型从 WillForm 导入
import { getWills, deleteWill, updateWill } from '../api'; // 导入 API 函数
import MusicPlayer from '../components/MusicPlayer';

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
  console.log('[convertToRoomData] Input funeralRoom:', {
    roomId: funeralRoom.roomId,
    isOrganizer: funeralRoom.isOrganizer,
    isOrganizerType: typeof funeralRoom.isOrganizer,
    rawValue: funeralRoom.isOrganizer
  });
  
  // 确保isOrganizer在转换过程中正确处理（保持为false，除非显式设置为true）
  const isOrganizerValue = funeralRoom.isOrganizer === true;
  console.log('[convertToRoomData] isOrganizerValue after check:', isOrganizerValue);
  
  const result = {
    roomId: funeralRoom.roomId,
    password: funeralRoom.password || '',
    funeralType: funeralRoom.funeralType,
    backgroundImage: funeralRoom.backgroundImage,
    name: funeralRoom.deceasedName,
    deceasedImage: funeralRoom.deceasedImage,
    isOrganizer: isOrganizerValue // 使用处理后的值
  };
  
  console.log('[convertToRoomData] Output result:', {
    roomId: result.roomId,
    isOrganizer: result.isOrganizer,
    isOrganizerType: typeof result.isOrganizer
  });
  
  return result;
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

  // Will list state
  const [roomWills, setRoomWills] = useState<Will[]>([]);
  const [isLoadingRoomWills, setIsLoadingRoomWills] = useState(false);
  
  // 获取特定房间的遗嘱列表
  const fetchRoomWills = useCallback(async (currentRoomId: string) => {
    if (!currentRoomId) return;
    setIsLoadingRoomWills(true);
    try {
      const willsData = await getWills(currentRoomId);
      setRoomWills(willsData);
    } catch (err) {
      console.error("Failed to fetch wills for room:", err);
      setError(prevError => prevError ? `${prevError}\nFailed to load wills.` : 'Failed to load wills.');
    } finally {
      setIsLoadingRoomWills(false);
    }
  }, []);

  // 遗嘱相关的回调处理
  const handleWillCreated = () => {
    console.log('Will created, triggering refresh from InteractivePage for room:', urlRoomId);
    if (urlRoomId) {
      fetchRoomWills(urlRoomId); // 重新获取遗嘱列表
    }
  };

  const handleDeleteWillInRoom = async (willId: string) => {
    try {
      await deleteWill(willId);
      if (urlRoomId) fetchRoomWills(urlRoomId); // 重新获取
      alert('Will deleted successfully!');
    } catch (error) {
      console.error("Failed to delete will:", error);
      alert("Failed to delete will.");
    }
  };

  const handleUpdateWillInRoom = async (willId: string, fieldsToUpdate: Partial<Will>, videoBlob?: Blob) => {
    try {
      if (videoBlob) {
        const formData = new FormData();
        if (fieldsToUpdate.uploaderName !== undefined) formData.append('uploaderName', fieldsToUpdate.uploaderName);
        if (fieldsToUpdate.farewellMessage !== undefined) formData.append('farewellMessage', fieldsToUpdate.farewellMessage);
        formData.append('video', videoBlob, 'updated_farewell.webm');
        await updateWill(willId, formData, true);
      } else {
        await updateWill(willId, fieldsToUpdate, false);
      }
      if (urlRoomId) fetchRoomWills(urlRoomId); // 重新获取
      alert('Will updated successfully!');
    } catch (error) {
      console.error("Failed to update will:", error);
      alert("Failed to update will.");
    }
  };

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
      // Load all rooms (using cache)
      const rooms = await fetchAllRooms();

      // Check if there is a room ID in the URL or location state
      const stateData = location.state as FuneralRoom;

      if (stateData && stateData.roomId) {
        // If there is state data, set the current room
        console.log('[initializeData] Using state data with isOrganizer:', stateData.isOrganizer);
        setCurrentRoom(stateData);
        setIsLoadingCurrentRoom(false);
        if (stateData.roomId) fetchRoomWills(stateData.roomId); // 获取遗嘱
      } else if (urlRoomId) {
        // If there is roomId in the URL, load that room
        try {
          // Try to get it from the cache
          const cachedRoom = rooms.find(room => room.roomId === urlRoomId);
          if (cachedRoom) {
            console.log('[initializeData] Using cached room with isOrganizer:', cachedRoom.isOrganizer);
            setCurrentRoom(cachedRoom);
            setIsLoadingCurrentRoom(false);
          } else {
            // Get it from API
            console.log('[initializeData] Fetching room from API:', urlRoomId);
            const roomData = await getFuneralRoomById(urlRoomId);
            if (roomData) {
              console.log('[initializeData] Room data from API with isOrganizer:', roomData.isOrganizer);
              setCurrentRoom(roomData);
              setError(null);
            } else {
              setRoomNotFound(true);
              setError(`Room with ID "${urlRoomId}" not found.`);
            }
            setIsLoadingCurrentRoom(false);
          }
          if (urlRoomId) fetchRoomWills(urlRoomId); // 获取遗嘱
        } catch (err) {
          console.error(`Error in initializeData for room ${urlRoomId}:`, err);
          setError(`Failed to load room data for ${urlRoomId}. Please try again.`);
          setRoomNotFound(true);
          setIsLoadingCurrentRoom(false);
        }
      } else {
        // If no specific room is displayed, only show the room list
        setIsLoadingCurrentRoom(false);
      }
    };

    initializeData();
  }, [location, urlRoomId, fetchAllRooms, fetchRoomWills]);

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
      const verifyResult = await verifyRoomPassword(selectedRoomForPassword.roomId, password);
      
      if (verifyResult.valid) {
        // 关闭模态框
        setShowPasswordModal(false);
        
        // 设置选中的房间为当前房间，并将其标记为组织者（因为密码验证通过）
        const roomWithPassword = {
          ...selectedRoomForPassword,
          password,
          isOrganizer: true // 如果提供了正确的密码，则将用户标记为房间组织者
        };
        
        console.log('[handlePasswordSubmit] Setting current room with isOrganizer=true after password verification:', {
          roomId: roomWithPassword.roomId,
          isOrganizer: roomWithPassword.isOrganizer,
          isOrganizerType: typeof roomWithPassword.isOrganizer
        });
        
        setCurrentRoom(roomWithPassword);
        
        // 更新URL，不重新加载页面
        navigate(`/interactive/${selectedRoomForPassword.roomId}`, {
          replace: true,
          state: roomWithPassword
        });
        
        // 获取新房间的遗嘱
        if (selectedRoomForPassword.roomId) fetchRoomWills(selectedRoomForPassword.roomId);
        
        // 清除任何错误
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
            <div className="hero-info">
              <h1 className="hero-name">{currentRoom.deceasedName}</h1>
              <p className="hero-subtitle">Room ID: {currentRoom.roomId}</p>
              <p className="debug-info" style={{background: '#f0f0f0', padding: '4px', color: 'black'}}>
                DEBUG: isOrganizer = {String(currentRoom.isOrganizer)}
              </p>
            </div>
          </section>
          {/* Interactive function area - Now includes a drawing board and a music player */}
          {/* 仅当通过密码验证后才显示组织者功能 */}
          <div style={{padding: '10px', background: '#f0f0f0', margin: '10px 0', color: 'black'}}>
            DEBUG: isOrganizer = {String(currentRoom.isOrganizer)}
          </div>
          {/* 检查条件，确保只有真正的组织者才能编辑视频 */}
          <InteractionSection 
            roomData={convertToRoomData(currentRoom)} 
            onWillSuccessfullyCreated={handleWillCreated}
            wills={roomWills}
            isLoadingWills={isLoadingRoomWills}
            onDeleteWill={handleDeleteWillInRoom}
            onUpdateWill={handleUpdateWillInRoom}
            isOrganizer={currentRoom.isOrganizer === true} // 使用正确的isOrganizer值，恢复组织者权限
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