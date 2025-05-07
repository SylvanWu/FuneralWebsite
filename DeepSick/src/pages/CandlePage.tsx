// src/pages/CandlePage.tsx
// Dedicated page for "Light a Candle" interaction with user history

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import './InteractivePage.css'

interface CandleRecord {
  username: string;
  timestamp: string;
}

const CandlePage: React.FC = () => {
  // Local state for candle count
  const [candles, setCandles] = useState<number>(0);
  // Tracks if current user has already lit a candle
  const [hasLit, setHasLit] = useState<boolean>(false);
  // Username input
  const [username, setUsername] = useState<string>('');
  // History of lighting events
  const [records, setRecords] = useState<CandleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch history records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/interactive/candle');
        if (response.data.success) {
          setRecords(response.data.records);
          setCandles(response.data.totalCount);
        }
      } catch (err) {
        setError('Failed to fetch history');
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, []);

  const handleLightCandle = async () => {
    if (!username.trim() || hasLit || loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/interactive/candle', {
        username: username.trim()
      });
      
      if (response.data.success) {
        setCandles(response.data.totalCount);
        setRecords(prev => [response.data.record, ...prev]);
        setHasLit(true);
      }
    } catch (err) {
      setError('Failed to light candle. Please try again later.');
      console.error('Error lighting candle:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interactive-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-name">Light a Candle</h1>
        <p className="hero-subtitle">🕯️ {candles}</p>
      </section>

      {/* Username input and action button */}
      <section className="cards-section" style={{ justifyContent: 'center', gap: '1rem' }}>
        <input
          type="text"
          className="message-input"
          placeholder="Enter your name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={hasLit}
        />
        <button
          className="action-button"
          onClick={handleLightCandle}
          disabled={hasLit || !username.trim() || loading}
        >
          {loading ? 'Processing...' : hasLit ? 'Already Lit' : 'Light a Candle'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </section>

      {/* History of who lit a candle and when */}
      <section className="interactive-area">
        <h2 style={{ marginBottom: '1rem' }}>Candle Lighting History</h2>
        {records.length === 0 ? (
          <p className="no-messages">No candle lighting records yet</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {records.map((r, idx) => (
              <li key={idx} className="message-card" style={{ marginBottom: '0.5rem' }}>
                <span className="message-author">{r.username}</span>{' '}
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
