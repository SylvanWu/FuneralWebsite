// src/pages/MessagePage.tsx
// Dedicated page for "Leave a Message" interaction with real-time chat canvas via WebSocket

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import '../App.css';

// Type for each chat message
interface MessageRecord {
  user: string;
  content: string;
  time: string;
}

// Initialize WebSocket connection
const socket: Socket = io('http://localhost:3000');

const MessagePage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [records, setRecords] = useState<MessageRecord[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial message history
    socket.on('messageHistory', (history: MessageRecord[]) => {
      setRecords(history);
      scrollToBottom();
    });
    // Listen for new incoming messages
    socket.on('newMessage', (record: MessageRecord) => {
      setRecords(prev => [...prev, record]);
      scrollToBottom();
    });
    // Request initial data
    socket.emit('getMessageHistory');

    return () => {
      socket.off('messageHistory');
      socket.off('newMessage');
      socket.disconnect();
    };
  }, []);

  // Scroll canvas to bottom on new message
  const scrollToBottom = () => {
    if (canvasRef.current) {
      canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
    }
  };

  // Send a new chat message
  const handleSend = () => {
    if (!username.trim() || !content.trim()) return;
    const record: MessageRecord = {
      user: username.trim(),
      content: content.trim(),
      time: new Date().toISOString(),
    };
    socket.emit('sendMessage', record);
    setContent('');
    // optimistic UI: record will be added on 'newMessage'
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
