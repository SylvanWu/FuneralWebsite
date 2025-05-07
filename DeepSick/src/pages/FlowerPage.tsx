// src/pages/FlowerPage.tsx
// Dedicated page for "Offer Flowers" interaction with user history

import React, { useState } from 'react';
import '../App.css';

const FlowerPage: React.FC = () => {
  // State for total flowers count
  const [flowers, setFlowers] = useState<number>(0);
  // Prevent multiple offers per user
  const [hasOffered, setHasOffered] = useState<boolean>(false);
  // Input for username
  const [username, setUsername] = useState<string>('');
  // History of flower offerings
  const [records, setRecords] = useState<any[]>([]);

  // 仅本地交互，无 socket
  const handleOfferFlower = () => {
    if (!username.trim() || hasOffered) return;
    const record = { user: username.trim(), time: new Date().toISOString() };
    setFlowers(prev => prev + 1);
    setRecords(prev => [record, ...prev]);
    setHasOffered(true);
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
