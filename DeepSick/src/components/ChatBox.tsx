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

export const ChatBox: React.FC<ChatBoxProps> = ({ roomId, userId, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // 监听新消息
    socket.on('chat-message', (message: Message) => {
      console.log('收到消息', message);
      setMessages(prev => [...prev, message]);
    });

    // 监听聊天历史
    socket.on('chat-history', (history: Message[]) => {
      setMessages(history);
    });

    // 监听用户加入
    socket.on('user-joined', (data) => {
      setMessages(prev => [...prev, {
        userId: 'system',
        username: 'System',
        message: `${data.username} 加入了房间`,
        timestamp: data.timestamp
      }]);
    });

    // 监听用户离开
    socket.on('user-left', (data) => {
      setMessages(prev => [...prev, {
        userId: 'system',
        username: 'System',
        message: `用户离开了房间`,
        timestamp: data.timestamp
      }]);
    });

    // 监听连接状态
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // 加入房间
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
      socket.emit('chat-message', {
        roomId,
        message: newMessage.trim(),
        username,
        userId
      });
      setNewMessage('');
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>聊天室</span>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '已连接' : '已断开'}
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
              {new Date(msg.timestamp).toLocaleTimeString()}
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
          placeholder="输入消息..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected}>
          发送
        </button>
      </form>
    </div>
  );
}; 