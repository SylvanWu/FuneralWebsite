// src/pages/FlowerPage.tsx
// Dedicated page for "Offer Flowers" interaction with user history

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import './InteractivePage.css';

interface FlowerRecord {
  username: string;
  timestamp: string;
}

interface FlowerDisplay {
  id: number;
  isVisible: boolean;
}

const FLOWER_TYPES = ['🌹', '🌷', '🌺', '🌸', '🌼', '💐'];

const FlowerPage: React.FC = () => {
  // States for flowers display and records
  const [flowers, setFlowers] = useState<FlowerDisplay[]>(
    Array.from({ length: 48 }, (_, i) => ({ id: i + 1, isVisible: false }))
  );
  const [totalFlowers, setTotalFlowers] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [records, setRecords] = useState<FlowerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Get a random flower emoji
  const getRandomFlower = () => {
    return FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
  };

  // Fetch history records and flower count
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/interactive/flower');
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
  }, []);

  const handleOfferFlower = async () => {
    if (!username.trim() || loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/interactive/flower', {
        username: username.trim()
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
      }
    } catch (err) {
      setError('Failed to offer flowers. Please try again.');
      console.error('Error offering flower:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interactive-page">
      {/* Hero Section */}
      <section className="hero-section">
        <img src="/image.png" alt="Memorial Hall" className="hero-image" />
        <h1 className="hero-name">NAME</h1>
        <p className="hero-subtitle">MOTTO</p>
      </section>

      {/* Title Section */}
      <section className="hero-section">
        <h1 className="hero-name">Offer Flowers</h1>
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
          <button
            className="action-button"
            onClick={handleOfferFlower}
            disabled={!username.trim() || loading}
          >
            {loading ? 'Offering...' : 'Offer Flowers'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </section>

      {/* Offering History */}
      <section className="interactive-area">
        <h2>Flower Offering History</h2>
        {records.length === 0 ? (
          <p className="no-messages">No flowers have been offered yet</p>
        ) : (
          <ul className="history-list">
            {records.map((r, idx) => (
              <li key={idx} className="message-card">
                <span className="message-author">{r.username}</span>
                <span className="flower-info">offered flowers</span>
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
