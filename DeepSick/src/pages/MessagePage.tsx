// src/pages/MessagePage.tsx
// Dedicated page for "Leave a Message" interaction with real-time chat canvas via WebSocket

import React, { useState, useRef } from 'react';
import '../App.css';

// Type for each chat message
interface MessageRecord {
  user: string;
  content: string;
  time: string;
}

const MessagePage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [records, setRecords] = useState<MessageRecord[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 仅本地交互，无 socket
  const handleSend = () => {
    if (!username.trim() || !content.trim()) return;
    const record = {
      user: username.trim(),
      content: content.trim(),
      time: new Date().toISOString(),
    };
    setRecords(prev => [...prev, record]);
    setContent('');
  };

  return (
    <div className="interactive-page">
      {/* Header */}
      <section className="hero-section">
        <h1 className="hero-name">Leave a Message</h1>
        <p className="hero-subtitle">Real-time chat, unlimited messages</p>
      </section>

      {/* Chat canvas */}
      <section className="interactive-area">
        <div ref={canvasRef} className="message-canvas">
          {records.map((r, idx) => (
            <div key={idx} className="message-card">
              <p className="message-content">"{r.content}"</p>
              <div className="message-meta">
                <span className="message-author">{r.user}</span>
                <span className="message-time">{new Date(r.time).toLocaleString()}</span>
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
            placeholder="Type a message..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
          />
          <button
            className="action-button"
            onClick={handleSend}
            disabled={!username.trim() || !content.trim()}
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
};

export default MessagePage;
