// src/pages/FlowerPage.tsx
// Dedicated page for "Offer Flowers" interaction with user history

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import '../App.css';

// Initialize socket.io client
const socket: Socket = io('http://localhost:3000');

// Type for a flower offering record
interface FlowerRecord {
  user: string;
  time: string;
}

const FlowerPage: React.FC = () => {
  // State for total flowers count
  const [flowers, setFlowers] = useState<number>(0);
  // Prevent multiple offers per user
  const [hasOffered, setHasOffered] = useState<boolean>(false);
  // Input for username
  const [username, setUsername] = useState<string>('');
  // History of flower offerings
  const [records, setRecords] = useState<FlowerRecord[]>([]);

  useEffect(() => {
    // Listen for overall flower count
    socket.on('flowerCount', (count: number) => {
      setFlowers(count);
    });
    // Listen for individual offering events
    socket.on('flowerOfferedByUser', (record: FlowerRecord) => {
      setRecords(prev => [record, ...prev]);
    });
    // Request initial data
    socket.emit('getFlowerCount');
    socket.emit('getFlowerHistory');

    return () => {
      socket.off('flowerCount');
      socket.off('flowerOfferedByUser');
    };
  }, []);

  // Handler for offering a flower
  const handleOfferFlower = () => {
    if (!username.trim() || hasOffered) return;
    const record: FlowerRecord = { user: username.trim(), time: new Date().toISOString() };
    // Optimistically update UI
    setFlowers(prev => prev + 1);
    setRecords(prev => [record, ...prev]);
    setHasOffered(true);
    // Emit to server
    socket.emit('offerFlower', record);
  };

  return (
    <div className="interactive-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-name">Offer Flowers</h1>
        <p className="hero-subtitle">💐 {flowers}</p>
      </section>

      {/* Username input + action button */}
      <section className="cards-section" style={{ justifyContent: 'center', gap: '1rem' }}>
        <input
          type="text"
          className="message-input"
          placeholder="Enter your name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={hasOffered}
        />
        <button
          className="action-button"
          onClick={handleOfferFlower}
          disabled={hasOffered || !username.trim()}
        >
          {hasOffered ? 'Offered' : 'Offer Flower'}
        </button>
      </section>

      {/* History of offerings */}
      <section className="interactive-area">
        <h2 style={{ marginBottom: '1rem' }}>Flower Offering History</h2>
        {records.length === 0 ? (
          <p className="no-messages">No flower offerings yet.</p>
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

export default FlowerPage;
