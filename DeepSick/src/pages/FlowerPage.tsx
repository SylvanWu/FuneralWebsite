// src/pages/FlowerPage.tsx
// Page component for the "Lay Flowers" memorial interaction feature
// Allows visitors to offer virtual flowers and view flower offering history

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import './InteractivePage.css';
import { getFuneralRoomById } from '../services/funeralRoomDatabase';

// Get server URL from environment variable or use default
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

interface FlowerRecord {
  username: string;
  flowerType: string;
  timestamp: string;
}

interface RoomData {
  roomId: string;
  password: string;
  funeralType: string;
  backgroundImage: string;
  name: string;
  deceasedImage?: string;
  deceasedName?: string;
}

interface FlowerDisplay {
  id: number;
  isVisible: boolean;
  flowerType?: string;
}

const FLOWER_TYPES = ['🌹', '🌷', '🌺', '🌸', '🌼', '💐'];

const FlowerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  
  // States for flowers display and records
  const [flowers, setFlowers] = useState<FlowerDisplay[]>(
    Array.from({ length: 48 }, (_, i) => ({ id: i + 1, isVisible: false }))
  );
  const [totalFlowers, setTotalFlowers] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [records, setRecords] = useState<FlowerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [displayedFlowers, setDisplayedFlowers] = useState<FlowerDisplay[]>([]);

  // Get room data from location state or fetch it
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        // First try to get from location state
        const state = location.state as RoomData;
        if (state && state.roomId) {
          setRoomData(state);
          return;
        }

        // If no state and no roomId, redirect to funeral hall
        if (!roomId) {
          navigate('/funeralhall');
          return;
        }

        // Fetch room data using roomId
        const fetchedRoom = await getFuneralRoomById(roomId);
        if (fetchedRoom) {
          setRoomData({
            roomId: fetchedRoom.roomId,
            password: fetchedRoom.password || '',
            funeralType: fetchedRoom.funeralType,
            backgroundImage: fetchedRoom.backgroundImage,
            name: fetchedRoom.deceasedName,
            deceasedName: fetchedRoom.deceasedName,
            deceasedImage: fetchedRoom.deceasedImage
          });
        } else {
          setError('Room not found');
          navigate('/funeralhall');
        }
      } catch (err) {
        console.error('Error loading room data:', err);
        setError('Failed to load room data');
        navigate('/funeralhall');
      }
    };

    loadRoomData();
  }, [location, navigate, roomId]);

  // Get a random flower emoji
  const getRandomFlower = () => {
    return FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
  };

  // Fetch history records and flower count
  useEffect(() => {
    if (!roomData) return;

    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/interactive/flower/${roomData.roomId}`);
        if (response.data.success) {
          setRecords(response.data.records);
          const total = response.data.totalCount;
          setTotalFlowers(total);
          
          // 创建并保存固定的花朵显示
          const newDisplayedFlowers = Array.from({ length: Math.min(total, 48) }, (_, index) => ({
            id: index + 1,
            isVisible: true,
            flowerType: getRandomFlower()
          }));
          setDisplayedFlowers(newDisplayedFlowers);
        }
      } catch (err) {
        setError('Failed to fetch records');
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, [roomData]);

  const handleOfferFlower = async () => {
    if (!username.trim() || loading || !roomData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const randomFlower = getRandomFlower();
      const response = await axios.post(`${SERVER_URL}/api/interactive/flower/${roomData.roomId}`, {
        username: username.trim(),
        flowerType: randomFlower
      });
      
      if (response.data.success) {
        const newTotal = response.data.totalCount;
        setTotalFlowers(newTotal);
        
        // 添加新的花朵到显示列表
        if (newTotal <= 48) {
          setDisplayedFlowers(prev => [
            ...prev,
            {
              id: newTotal,
              isVisible: true,
              flowerType: randomFlower
            }
          ]);
        }
        
        setRecords(prev => [response.data.record, ...prev]);
        setUsername('');
      }
    } catch (err) {
      setError('Failed to offer flower. Please try again.');
      console.error('Error offering flower:', err);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Hero Section */}
      <section className="hero-section">
        <img 
          src={roomData?.deceasedImage || roomData?.backgroundImage} 
          alt={roomData?.deceasedName || roomData?.name} 
          className="hero-image" 
        />
        <h1 className="hero-name">{roomData?.deceasedName || roomData?.name}</h1>
        <p className="hero-subtitle">Room ID: {roomData?.roomId}</p>
      </section>

      {/* Title Section */}
      <section className="hero-section">
        <h1 className="hero-name">Lay Flowers</h1>
        <p className="hero-subtitle">Total Flowers: {totalFlowers}</p>
      </section>

      {/* Flowers Display */}
      <section className="flowers-container">
        <div className="flowers-grid">
          {displayedFlowers.map((flower) => (
            <div 
              key={flower.id} 
              className="flower-item visible"
            >
              <div className="flower-emoji">{flower.flowerType}</div>
            </div>
          ))}
        </div>
      </section>

      {/* User Input and Action Button */}
      <section className="input-section">
        <div className="input-group">
          <input
            type="text"
            className="message-input"
            placeholder="Enter your name"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button
            className="action-button"
            onClick={handleOfferFlower}
            disabled={!username.trim() || loading}
          >
            {loading ? 'Laying...' : 'Lay Flowers'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </section>

      {/* Offering History */}
      <section className="interactive-area">
        <h2>Flower Offering History</h2>
        {records.length === 0 ? (
          <p className="no-messages">No flowers have been laid yet</p>
        ) : (
          <ul className="history-list">
            {records.map((r, idx) => (
              <li key={idx} className="message-card">
                <span className="message-author">{r.username}</span>
                <span className="flower-info">laid {r.flowerType}</span>
                <span className="message-time">{new Date(r.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default FlowerPage;
