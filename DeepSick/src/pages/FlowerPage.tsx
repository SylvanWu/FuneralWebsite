// src/pages/FlowerPage.tsx
// Dedicated page for "Offer Flowers" interaction with user history

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

interface FlowerRecord {
  username: string;
  timestamp: string;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch history records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/interactive/flower');
        if (response.data.success) {
          setRecords(response.data.records);
          setFlowers(response.data.totalCount);
        }
      } catch (err) {
        setError('Failed to fetch history');
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, []);

  const handleOfferFlower = async () => {
    if (!username.trim() || hasOffered || loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/interactive/flower', {
        username: username.trim()
      });
      
      if (response.data.success) {
        setFlowers(response.data.totalCount);
        setRecords(prev => [response.data.record, ...prev]);
        setHasOffered(true);
      }
    } catch (err) {
      setError('Failed to offer flowers. Please try again later.');
      console.error('Error offering flower:', err);
    } finally {
      setLoading(false);
    }
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
          disabled={hasOffered || !username.trim() || loading}
        >
          {loading ? 'Processing...' : hasOffered ? 'Already Offered' : 'Offer Flowers'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </section>

      {/* History of offerings */}
      <section className="interactive-area">
        <h2 style={{ marginBottom: '1rem' }}>Flower Offering History</h2>
        {records.length === 0 ? (
          <p className="no-messages">No flower offerings yet</p>
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

export default FlowerPage;
