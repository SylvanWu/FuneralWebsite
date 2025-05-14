import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Create a context for the socket instance
const SocketContext = createContext<Socket | null>(null);

// Get server URL from environment variable or use default
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

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

    // Listen for connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    // Listen for disconnect events
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    // Listen for reconnection attempt events
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      reconnectAttemptsRef.current = attemptNumber;
    });

    // Listen for reconnection failure events
    socket.on('reconnect_failed', () => {
      console.log('Failed to reconnect after maximum attempts');
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        // Add reconnection failure handling logic here
        console.log('Maximum reconnection attempts reached');
      }
    });

    // Listen for reconnection success events
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    return () => {
      // Clean up all event listeners
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect_failed');
      socket.off('reconnect');
      // Disconnect socket
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