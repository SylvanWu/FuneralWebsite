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
import WillForm from '../components/WillForm';
import { Will } from '../components/WillForm'; // Will 类型从 WillForm 导入或 WillList
import WillList from '../components/WillList'; // 导入 WillList
import { getWills, deleteWill, updateWill } from '../api'; // 导入 API 函数

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

// 将FuneralRoom类型转换为RoomData类型的工具函数
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

// 缓存有效期（毫秒）
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5分钟

// 主页面组件
const InteractivePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  
  // 房间数据状态
  const [currentRoom, setCurrentRoom] = useState<FuneralRoom | null>(null);
  const [allRooms, setAllRooms] = useState<FuneralRoom[]>([]);
  const [isLoadingCurrentRoom, setIsLoadingCurrentRoom] = useState(true);
  const [isLoadingAllRooms, setIsLoadingAllRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomNotFound, setRoomNotFound] = useState<boolean>(false);
  
  // 在组件函数顶层添加日志，用于调试 props 和 state
  console.log(
    '[InteractivePage DEBUG] Render. urlRoomId:', urlRoomId, 
    'currentRoom?.isOrganizer:', currentRoom?.isOrganizer,
    'currentRoom exists:', !!currentRoom
  );

  // 缓存状态
  const [roomsCache, setRoomsCache] = useState<{
    data: FuneralRoom[];
    timestamp: number;
  } | null>(null);
  
  // 密码模态框状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoomForPassword, setSelectedRoomForPassword] = useState<FuneralRoom | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 遗嘱列表状态
  const [roomWills, setRoomWills] = useState<Will[]>([]);
  const [isLoadingRoomWills, setIsLoadingRoomWills] = useState(false);

  // 获取所有房间函数 - 使用缓存以避免频繁API调用
  const fetchAllRooms = useCallback(async (forceRefresh: boolean = false) => {
    // 如果有有效的缓存并且不是强制刷新，则使用缓存
    if (
      roomsCache && 
      !forceRefresh && 
      Date.now() - roomsCache.timestamp < CACHE_EXPIRY_TIME
    ) {
      setAllRooms(roomsCache.data);
      setIsLoadingAllRooms(false);
      return roomsCache.data;
    }
    
    // 否则从API获取新数据
    setIsLoadingAllRooms(true);
    
    try {
      const rooms = await getAllFuneralRooms();
      
      // 更新缓存和状态
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
  
  // 根据ID加载特定房间
  const loadRoomById = useCallback(async (roomId: string, cachedRooms: FuneralRoom[]) => {
    setIsLoadingCurrentRoom(true);
    setRoomNotFound(false);
    
    try {
      // 首先尝试从已缓存的房间列表中查找
      const cachedRoom = cachedRooms.find(room => room.roomId === roomId);
      if (cachedRoom) {
        setCurrentRoom(cachedRoom);
        setIsLoadingCurrentRoom(false);
        return;
      }
      
      // 如果缓存中没有，则从API获取
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

  // 获取特定房间的遗嘱列表
  const fetchRoomWills = useCallback(async (currentRoomId: string) => {
    if (!currentRoomId) return;
    setIsLoadingRoomWills(true);
    try {
      const willsData = await getWills(currentRoomId);
      setRoomWills(willsData);
    } catch (err) {
      console.error("Failed to fetch wills for room:", err);
      // 你可以设置一个特定的错误状态给用户，或者在主错误提示中添加信息
      setError(prevError => prevError ? `${prevError}\nFailed to load wills.` : 'Failed to load wills.');
    } finally {
      setIsLoadingRoomWills(false);
    }
  }, []);

  // 初始化数据 - 从URL或location state加载房间
  useEffect(() => {
    const initializeData = async () => {
      // 加载所有房间（使用缓存）
      const rooms = await fetchAllRooms();
      
      // 检查是否有房间ID在URL或location state中
      const stateData = location.state as FuneralRoom;
      
      if (stateData && stateData.roomId) {
        // 如果有state数据，使用它设置当前房间
        console.log('[initializeData] Using state data with isOrganizer:', stateData.isOrganizer);
        setCurrentRoom(stateData);
        setIsLoadingCurrentRoom(false);
        if (stateData.roomId) fetchRoomWills(stateData.roomId); // 获取遗嘱
      } else if (urlRoomId) {
        // 如果URL中有roomId，加载该房间
        try {
          // 尝试从缓存中获取
          const cachedRoom = rooms.find(room => room.roomId === urlRoomId);
          if (cachedRoom) {
            console.log('[initializeData] Using cached room with isOrganizer:', cachedRoom.isOrganizer);
            setCurrentRoom(cachedRoom);
            setIsLoadingCurrentRoom(false);
          } else {
            // 从API获取
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
        // 如果没有指定房间，只显示房间列表
        setIsLoadingCurrentRoom(false);
      }
    };
    
    initializeData();
  }, [location, urlRoomId, fetchAllRooms, fetchRoomWills]);
  
  // 处理从RoomList选择房间
  const handleRoomSelect = (room: FuneralRoom) => {
    setSelectedRoomForPassword(room);
    setShowPasswordModal(true);
    setPasswordError(null);
  };
  
  // 处理切换到其他房间的快捷方式
  const switchRoom = (roomId: string) => {
    const targetRoom = allRooms.find(room => room.roomId === roomId);
    if (targetRoom) {
      handleRoomSelect(targetRoom);
    }
  };
  
  // 处理模态框关闭
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setSelectedRoomForPassword(null);
    setPasswordError(null);
  };
  
  // 处理密码提交
  const handlePasswordSubmit = async (password: string) => {
    if (!selectedRoomForPassword) return;
    
    try {
      const isValid = await verifyRoomPassword(selectedRoomForPassword.roomId, password);
      
      if (isValid) {
        // 关闭模态框
        setShowPasswordModal(false);
        
        // 设置选中的房间为当前房间，并将其标记为组织者（因为密码验证通过）
        const roomWithPassword = {
          ...selectedRoomForPassword,
          password,
          isOrganizer: true // 如果提供了正确的密码，则将用户标记为房间组织者
        };
        
        console.log('[handlePasswordSubmit] Setting current room with isOrganizer=true after password verification');
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
  
  // 处理刷新房间列表
  const handleRefreshRooms = () => {
    fetchAllRooms(true); // 强制刷新
  };
  
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
  
  // 如果正在加载当前房间，显示加载状态
  if (isLoadingCurrentRoom) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room data...</p>
      </div>
    );
  }

  // 记录关键信息，但不使用useEffect（避免hooks顺序问题）
  if (currentRoom) {
    console.log('[InteractivePage] Render Info:', {
      roomId: currentRoom.roomId,
      isOrganizer: currentRoom.isOrganizer,
      willsCount: roomWills.length
    });
  }

  return (
    <div className="interactive-page">
      {/* 面包屑导航 */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/funeralhall" className="breadcrumb-link">Funeral Hall</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {currentRoom ? `${currentRoom.deceasedName}'s Memorial` : 'Interactive Page'}
        </span>
      </nav>

      {/* 错误提示 */}
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

      {/* 如果有当前房间，显示房间详情和互动功能 */}
      {currentRoom ? (
        <>
          {/* 房间信息区域 */}
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
          
          {/* 互动功能区域 - 现在包含了画板、音乐播放器和遗嘱列表 */}
          <InteractionSection 
            roomData={convertToRoomData(currentRoom)} 
            onWillSuccessfullyCreated={handleWillCreated}
            wills={roomWills}
            isLoadingWills={isLoadingRoomWills}
            onDeleteWill={handleDeleteWillInRoom}
            onUpdateWill={handleUpdateWillInRoom}
            isOrganizer={true}
          />
        </>
      ) : (
        /* 如果没有当前房间，显示欢迎信息 */
        <div className="welcome-section">
          <h1>Welcome to the Funeral Memorial Hall</h1>
          <p>Please select a room below to enter and pay your respects</p>
        </div>
      )}

      {/* 密码模态框 */}
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
