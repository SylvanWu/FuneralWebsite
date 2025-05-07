// src/pages/CandlePage.tsx
// Dedicated page for "Light a Candle" interaction with user history

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import '../App.css';
import './InteractivePage.css'
// Initialize socket.io client
const socket: Socket = io('http://localhost:3000');

// Type for a candle action record
interface CandleRecord {
  user: string;
  time: string;
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

  useEffect(() => {
    // Receive overall count
    socket.on('candleCount', (count: number) => {
      setCandles(count);
    });
    // Receive individual lighting records
    socket.on('candleLitByUser', (record: CandleRecord) => {
      setRecords(prev => [record, ...prev]);
    });
    // Request initial data
    socket.emit('getCandleCount');
    socket.emit('getCandleHistory');

    return () => {
      socket.off('candleCount');
      socket.off('candleLitByUser');
    };
  }, []);

  // Handle button click: emit event with user and disable further clicks
  const handleLightCandle = () => {
    if (!username.trim() || hasLit) return;
    const record = { user: username.trim(), time: new Date().toISOString() };
    // Optimistically update
    setCandles(prev => prev + 1);
    setRecords(prev => [record, ...prev]);
    setHasLit(true);
    // Emit to server
    socket.emit('lightCandle', record);
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
          disabled={hasLit || !username.trim()}
        >
          {hasLit ? 'Already Lit' : 'Light a Candle'}
        </button>
      </section>

      {/* History of who lit a candle and when */}
      <section className="interactive-area">
        <h2 style={{ marginBottom: '1rem' }}>Candle Lighting History</h2>
        {records.length === 0 ? (
          <p className="no-messages">No candle lighting yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {records.map((r, idx) => (
              <li key={idx} className="message-card" style={{ marginBottom: '0.5rem' }}>
                <span className="message-author">{r.user}</span>{' '}
                <span className="message-time">{new Date(r.time).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CandlePage;
