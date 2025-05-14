import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Create a context for the socket instance
const SocketContext = createContext<Socket | null>(null);

// 根据不同环境获取服务器URL
const getServerURL = () => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';
  } else {
    // 部署环境，使用相同的域名但保持端口号
    return `${window.location.protocol}//${host}:5001`;
  }
};

// Get server URL based on environment
const SERVER_URL = getServerURL();
console.log('Using Socket SERVER_URL:', SERVER_URL);

// Provider component to wrap the app and provide the socket instance
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    // Initialize the socket connection only once
    socketRef.current = io(SERVER_URL, {
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 3000,
      timeout: 20000,
      transports: ['polling', 'websocket'],
      forceNew: true,
      reconnection: true,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      autoConnect: true,
      withCredentials: true,
      path: '/socket.io/',
      upgrade: true,
      rememberUpgrade: true,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    const socket = socketRef.current;

    // 监听连接事件
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    // 监听断开连接事件
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    // 监听重连尝试事件
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      reconnectAttemptsRef.current = attemptNumber;
    });

    // 监听重连失败事件
    socket.on('reconnect_failed', () => {
      console.log('Failed to reconnect after maximum attempts');
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        // 可以在这里添加重连失败后的处理逻辑
        console.log('Maximum reconnection attempts reached');
      }
    });

    // 监听重连成功事件
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    return () => {
      // 清理所有事件监听器
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect_failed');
      socket.off('reconnect');
      // 断开连接
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket instance
export const useSocket = () => useContext(SocketContext); 