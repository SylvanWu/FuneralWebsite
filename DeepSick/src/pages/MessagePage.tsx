// src/pages/MessagePage.tsx
// Page component for the "Leave a Message" memorial interaction feature
// Allows visitors to leave messages and view message history

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import './InteractivePage.css';
import { getFuneralRoomById } from '../services/funeralRoomDatabase';

// Get server URL from environment variable or use default
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

interface MessageRecord {
  username: string;
  content: string;
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

const MessagePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  
  // Message states
  const [username, setUsername] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [records, setRecords] = useState<MessageRecord[]>([]);
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

  // Fetch message history
  useEffect(() => {
    if (!roomData) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/interactive/message/${roomData.roomId}`);
        if (response.data.success) {
          setRecords(response.data.records || []);
        }
      } catch (err) {
        setError('Failed to fetch messages');
        console.error('Error fetching messages:', err);
        setRecords([]); // 确保在错误时设置为空数组
      }
    };
    fetchMessages();
  }, [roomData]);

  const handleSendMessage = async () => {
    if (!username.trim() || !message.trim() || loading || !roomData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/interactive/message/${roomData.roomId}`, {
        username: username.trim(),
        message: message.trim()
      });
      
      if (response.data.success) {
        setRecords(prev => [response.data.record, ...prev]);
        setUsername('');
        setMessage('');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
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
        <h1 className="hero-name">Leave a Message</h1>
        <p className="hero-subtitle">Share your thoughts and memories</p>
      </section>

      {/* Message Input */}
      <section className="input-section">
        <div className="input-group">
          <input
            type="text"
            className="message-input"
            placeholder="Enter your name"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <textarea
            className="message-textarea"
            placeholder="Write your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
          />
          <button
            className="action-button"
            onClick={handleSendMessage}
            disabled={!username.trim() || !message.trim() || loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </section>

      {/* Message History */}
      <section className="interactive-area">
        <h2>Message History</h2>
        {!records || records.length === 0 ? (
          <p className="no-messages">No messages have been left yet</p>
        ) : (
          <ul className="history-list">
            {records.map((r, idx) => (
              <li key={idx} className="message-card">
                <div className="message-header">
                  <span className="message-author">{r.username}</span>
                  <span className="message-time">{new Date(r.timestamp).toLocaleString()}</span>
                </div>
                <p className="message-content">{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default MessagePage;
