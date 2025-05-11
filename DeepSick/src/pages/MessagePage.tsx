// src/pages/MessagePage.tsx
// Dedicated page for "Leave a Message" interaction

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

// Type for each chat message
interface MessageRecord {
  username: string;
  content: string;
  timestamp: string;
}

const MessagePage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [records, setRecords] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch history records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/interactive/message');
        if (response.data.success) {
          setRecords(response.data.records);
        }
      } catch (err) {
        setError('Failed to fetch history');
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, []);

  const handleSend = async () => {
    if (!username.trim() || !content.trim() || loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/interactive/message', {
        username: username.trim(),
        content: content.trim()
      });
      
      if (response.data.success) {
        setRecords(prev => [...prev, response.data.record]);
        setContent('');
        // Scroll to latest message
        if (canvasRef.current) {
          canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
        }
      }
    } catch (err) {
      setError('Failed to send message. Please try again later.');
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interactive-page">
      {/* Header */}
      <section className="hero-section">
        <h1 className="hero-name">Message Board</h1>
        <p className="hero-subtitle">Leave your blessings and remembrances</p>
      </section>

      {/* Chat canvas */}
      <section className="interactive-area">
        <h2>Message Board</h2>
        <div ref={canvasRef} className="message-canvas">
          {records.map((r, idx) => (
            <div key={idx} className="message-card">
              <p className="message-content">"{r.content}"</p>
              <div className="message-meta">
                <span className="message-author">{r.username}</span>
                <span className="message-time">{new Date(r.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="message-form-wrapper">
          <input
            type="text"
            className="message-input"
            placeholder="Your name"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <textarea
            className="message-input"
            placeholder="Type your message..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
          />
          <button
            className="action-button"
            onClick={handleSend}
            disabled={!username.trim() || !content.trim() || loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </section>
    </div>
  );
};

export default MessagePage;
