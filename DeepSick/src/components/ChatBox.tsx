import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import '../styles/ChatBox.css';

interface Message {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface ChatBoxProps {
  roomId: string;
  userId: string;
  username: string;
}

// Time formatting helper function
const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  // Format time part
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // If message is from today, only show time
  if (isToday) {
    return timeStr;
  }
  
  // If message is from yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${timeStr}`;
  }
  
  // If message is from this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  // If message is from earlier
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const ChatBox: React.FC<ChatBoxProps> = ({ roomId, userId, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('chat-message', (message: Message) => {
      console.log('Received message', message);
      setMessages(prev => [...prev, message]);
    });

    // Listen for chat history
    socket.on('chat-history', (history: Message[]) => {
      setMessages(history);
    });

    // Listen for user join
    socket.on('user-joined', (data) => {
      setMessages(prev => [...prev, {
        userId: 'system',
        username: 'System',
        message: `${data.username} joined the room`,
        timestamp: new Date().toISOString()
      }]);
    });

    // Listen for user leave
    socket.on('user-left', (data) => {
      setMessages(prev => [...prev, {
        userId: 'system',
        username: 'System',
        message: `User left the room`,
        timestamp: new Date().toISOString()
      }]);
    });

    // Listen for connection status
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Join room
    socket.emit('joinRoom', { roomId, username });

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('chat-message');
      socket.off('chat-history');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && isConnected) {
      const timestamp = new Date().toISOString();
      socket.emit('chat-message', {
        roomId,
        message: newMessage.trim(),
        username,
        userId,
        timestamp
      });
      setNewMessage('');
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>Chat Room</span>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.userId === userId ? 'own-message' : ''} ${msg.userId === 'system' ? 'system-message' : ''}`}
          >
            {msg.userId !== 'system' && (
              <div className="message-username">{msg.username}</div>
            )}
            <div className="message-content">{msg.message}</div>
            <div className="message-time">
              {formatMessageTime(msg.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected}>
          Send
        </button>
      </form>
    </div>
  );
}; 