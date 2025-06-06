// src/pages/CandlePage.tsx
// Page component for the "Light a Candle" memorial interaction feature
// Allows visitors to light virtual candles and view candle lighting history

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import './InteractivePage.css'
import { getFuneralRoomById } from '../services/funeralRoomDatabase';

// Get server URL from environment variable or use default
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

interface CandleRecord {
  username: string;
  timestamp: string;
  candleId: number;
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

interface Candle {
  id: number;
  isLit: boolean;
}

const CandlePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  
  // Candle states
  const [candles, setCandles] = useState<Candle[]>(Array.from({ length: 54 }, (_, i) => ({ 
    id: i + 1, 
    isLit: false 
  })));
  const [username, setUsername] = useState<string>('');
  const [selectedCandle, setSelectedCandle] = useState<number | null>(null);
  const [records, setRecords] = useState<CandleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  // Fetch history records and lit candles
  useEffect(() => {
    if (!roomData) return;

    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/interactive/candle/${roomData.roomId}`);
        if (response.data.success) {
          setRecords(response.data.records);
          
          // Update candle states
          const litCandles = response.data.records.map((record: CandleRecord) => record.candleId);
          setCandles(prev => prev.map(candle => ({
            ...candle,
            isLit: litCandles.includes(candle.id)
          })));
        }
      } catch (err) {
        setError('Failed to fetch records');
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, [roomData]);

  const handleCandleClick = (candleId: number) => {
    if (candles.find(c => c.id === candleId)?.isLit) {
      return; // If candle is already lit, don't allow selection
    }
    setSelectedCandle(candleId);
  };

  const handleLightCandle = async () => {
    if (!username.trim() || !selectedCandle || loading || !roomData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/interactive/candle/${roomData.roomId}`, {
        username: username.trim(),
        candleId: selectedCandle
      });
      
      if (response.data.success) {
        // Update candle state
        setCandles(prev => prev.map(candle => 
          candle.id === selectedCandle ? { ...candle, isLit: true } : candle
        ));
        
        // Add to records
        setRecords(prev => [response.data.record, ...prev]);
        
        // Reset form
        setUsername('');
        setSelectedCandle(null);
      }
    } catch (err) {
      setError('Failed to light candle. Please try again.');
      console.error('Error lighting candle:', err);
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
          alt={roomData.deceasedName || roomData.name} 
          className="hero-image" 
        />
        <h1 className="hero-name">{roomData.deceasedName || roomData.name}</h1>
        <p className="hero-subtitle">Room ID: {roomData.roomId}</p>
      </section>

      {/* Title Section */}
      <section className="hero-section">
        <h1 className="hero-name">Light a Candle</h1>
        <p className="hero-subtitle">Start by choosing a candle and leaving your name below</p>
      </section>

      {/* Candles Grid */}
      <section className="candles-container">
        <div className="candles-grid">
          {candles.map((candle) => (
            <div key={candle.id} className="candle-item" onClick={() => handleCandleClick(candle.id)}>
              <div className="candle-number">#{candle.id}</div>
              <div 
                className={`candle-button ${candle.isLit ? 'lit' : ''} ${selectedCandle === candle.id ? 'selected' : ''}`}
              >
                🕯️
              </div>
              {selectedCandle === candle.id && (
                <div className="selected-indicator">Selected</div>
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
          <button
            className="action-button"
            onClick={handleLightCandle}
            disabled={!username.trim() || !selectedCandle || loading}
          >
            {loading ? 'Lighting...' : 'Light Candle'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </section>

      {/* Candle History */}
      <section className="interactive-area">
        <h2>Candle Lighting History</h2>
        {records.length === 0 ? (
          <p className="no-messages">No candles have been lit yet</p>
        ) : (
          <ul className="history-list">
            {records.map((r, idx) => (
              <li key={idx} className="message-card">
                <span className="message-author">{r.username}</span>
                <span className="candle-info">lit candle #{r.candleId}</span>
                <span className="message-time">{new Date(r.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CandlePage;
