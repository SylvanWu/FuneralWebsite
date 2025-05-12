import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Create a context for the socket instance
const SocketContext = createContext<Socket | null>(null);

// Provider component to wrap the app and provide the socket instance
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize the socket connection only once
    socketRef.current = io('http://localhost:5001', {
      reconnectionAttempts: 5,
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
    return () => {
      // Disconnect the socket when the provider is unmounted
      socketRef.current?.disconnect();
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