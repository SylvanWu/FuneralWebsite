// src/pages/FlowerPage.tsx
// Dedicated page for "Lay Flowers" interaction with user history

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import './InteractivePage.css';

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
}

interface FlowerDisplay {
  id: number;
  isVisible: boolean;
}

const FLOWER_TYPES = ['🌹', '🌷', '🌺', '🌸', '🌼', '💐'];

const FlowerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  
  // States for flowers display and records
  const [flowers, setFlowers] = useState<FlowerDisplay[]>(
    Array.from({ length: 48 }, (_, i) => ({ id: i + 1, isVisible: false }))
  );
  const [totalFlowers, setTotalFlowers] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [selectedFlower, setSelectedFlower] = useState<string>('');
  const [records, setRecords] = useState<FlowerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Get room data from location state
  useEffect(() => {
    const state = location.state as RoomData;
    if (state) {
      setRoomData(state);
    } else {
      // If no room data, redirect to funeral hall
      navigate('/funeralhall');
    }
  }, [location, navigate]);

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
          
          // Update visible flowers
          setFlowers(prev => prev.map((flower, index) => ({
            ...flower,
            isVisible: index < Math.min(total, 48)
          })));
        }
      } catch (err) {
        setError('Failed to fetch records');
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, [roomData]);

  const handleOfferFlower = async () => {
    if (!username.trim() || !selectedFlower || loading || !roomData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/interactive/flower/${roomData.roomId}`, {
        username: username.trim(),
        flowerType: selectedFlower
      });
      
      if (response.data.success) {
        const newTotal = response.data.totalCount;
        setTotalFlowers(newTotal);
        
        // Update visible flowers
        setFlowers(prev => prev.map((flower, index) => ({
          ...flower,
          isVisible: index < Math.min(newTotal, 48)
        })));
        
        setRecords(prev => [response.data.record, ...prev]);
        setUsername('');
        setSelectedFlower('');
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
          src={roomData.deceasedImage || roomData.backgroundImage} 
          alt={roomData.name} 
          className="hero-image" 
        />
        <h1 className="hero-name">{roomData.name}</h1>
        <p className="hero-subtitle">Room ID: {roomData.roomId}</p>
      </section>

      {/* Title Section */}
      <section className="hero-section">
        <h1 className="hero-name">Lay Flowers</h1>
        <p className="hero-subtitle">Total Flowers: {totalFlowers}</p>
      </section>

      {/* Flowers Display */}
      <section className="flowers-container">
        <div className="flowers-grid">
          {flowers.map((flower) => (
            <div 
              key={flower.id} 
              className={`flower-item ${flower.isVisible ? 'visible' : ''}`}
            >
              {flower.isVisible && (
                <div className="flower-emoji">{getRandomFlower()}</div>
              )}
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
          <select
            className="flower-select"
            value={selectedFlower}
            onChange={e => setSelectedFlower(e.target.value)}
          >
            <option value="">Select a flower</option>
            {FLOWER_TYPES.map((flower) => (
              <option key={flower} value={flower}>{flower}</option>
            ))}
          </select>
          <button
            className="action-button"
            onClick={handleOfferFlower}
            disabled={!username.trim() || !selectedFlower || loading}
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
