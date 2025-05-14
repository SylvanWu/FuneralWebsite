import React, { useCallback, useEffect, useState } from 'react';

// Save chat messages to localStorage
const saveMessages = useCallback((msgs: Message[]) => {
  try {
    localStorage.setItem(`chat_${roomId}`, JSON.stringify(msgs));
  } catch (err) {
    console.error('Failed to save messages to localStorage:', err);
  }
}, [roomId]);

// Restore chat messages from localStorage
const restoreMessages = useCallback(() => {
  try {
    const savedMessages = localStorage.getItem(`chat_${roomId}`);
    if (savedMessages && savedMessages !== "undefined") {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(parsedMessages);
    }
  } catch (err) {
    console.error('Failed to restore messages from localStorage:', err);
  }
}, [roomId]);

// Save to localStorage when messages update
const updateMessages = useCallback((newMessages: Message[]) => {
  setMessages(newMessages);
  saveMessages(newMessages);
}, [saveMessages]);

useEffect(() => {
  if (!socket) return;

  socket.on('reconnect', () => {
    setIsConnected(true);
    socket.emit('joinRoom', { roomId, username });
    socket.emit('requestChatHistory', roomId);
    restoreMessages();
  });

  socket.on('connect', () => {
    setIsConnected(true);
  });

  socket.on('disconnect', () => {
    setIsConnected(false);
  });

  socket.on('chat-message', (message: Message) => {
    updateMessages(prev => [...prev, message]);
  });

  socket.on('chat-history', (history: Message[]) => {
    updateMessages(history);
  });

  socket.on('user-joined', (data) => {
    updateMessages(prev => [...prev, {
      userId: 'system',
      username: 'System',
      message: `${data.username} joined the room`,
      timestamp: new Date().toISOString()
    }]);
  });

  socket.on('user-left', (data) => {
    updateMessages(prev => [...prev, {
      userId: 'system',
      username: 'System',
      message: `User left the room`,
      timestamp: new Date().toISOString()
    }]);
  });

  socket.emit('joinRoom', { roomId, username });
  restoreMessages();

  return () => {
    socket.emit('leaveRoom', roomId);
    socket.off('chat-message');
    socket.off('chat-history');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('connect');
    socket.off('disconnect');
    socket.off('reconnect');
  };
}, [socket, roomId, username, updateMessages, restoreMessages]); 