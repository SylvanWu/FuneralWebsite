import { Server } from 'socket.io';
import Canvas from '../models/Canvas.js';
import ChatMessage from '../models/ChatMessage.js';

// Interface for canvas state
const canvasStates = {};

// Initialize Canvas Socket.IO handler
export const initializeCanvasSocket = (io) => {
  // Load all canvases from the database
  const loadCanvases = async () => {
    try {
      const canvases = await Canvas.find();
      canvases.forEach(canvas => {
        if (!canvasStates[canvas.roomId]) {
          canvasStates[canvas.roomId] = {};
        }
        canvasStates[canvas.roomId][canvas.canvasId] = {
          width: canvas.width,
          height: canvas.height,
          backgroundColor: canvas.backgroundColor,
          drawings: canvas.drawings
        };
      });
      console.log('Loaded canvases from database');
    } catch (err) {
      console.error('Failed to load canvases:', err);
    }
  };

  // Save a canvas to the database
  const saveCanvas = async (roomId, canvasId) => {
    try {
      const canvasData = canvasStates[roomId][canvasId];
      await Canvas.findOneAndUpdate(
        { canvasId, roomId },
        {
          canvasId,
          roomId,
          width: canvasData.width,
          height: canvasData.height,
          backgroundColor: canvasData.backgroundColor,
          drawings: canvasData.drawings
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Failed to save canvas:', err);
    }
  };

  // Load initial canvases
  loadCanvases();

  io.on('connection', (socket) => {
    console.log('Canvas client connected');

    // Handle room joining
    socket.on('joinRoom', async (data) => {
      const { roomId, username } = data;
      socket.join(roomId);
      
      // Send current canvas states for this room
      if (canvasStates[roomId]) {
        socket.emit('canvasStates', canvasStates[roomId]);
      } else {
        canvasStates[roomId] = {};
        socket.emit('canvasStates', {});
      }

      // Load chat history
      try {
        const messages = await ChatMessage.find({ roomId })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();
        socket.emit('chat-history', messages.reverse());
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }

      // Notify others about new user
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        username,
        timestamp: new Date().toISOString()
      });
    });

    // Handle chat messages
    socket.on('chat-message', async (data) => {
      console.log('收到前端消息', data); // 调试用
      const { roomId, message, username, userId } = data;
      try {
        // Save message to database
        const chatMessage = new ChatMessage({
          roomId,
          userId,
          username,
          message,
          timestamp: new Date()
        });
        await chatMessage.save();

        // Broadcast message to room
        io.to(roomId).emit('chat-message', {
          userId,
          username,
          message,
          timestamp: chatMessage.timestamp
        });
      } catch (err) {
        console.error('Failed to save chat message:', err);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle user leaving
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // Handle canvas selection
    socket.on('selectCanvas', async (data) => {
      const { roomId, canvasId } = data;
      if (!canvasStates[roomId]) {
        canvasStates[roomId] = {};
      }
      if (!canvasStates[roomId][canvasId]) {
        // Try to load from database
        const canvas = await Canvas.findOne({ canvasId, roomId });
        if (canvas) {
          canvasStates[roomId][canvasId] = {
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            drawings: canvas.drawings
          };
        } else {
          // Create new canvas
          canvasStates[roomId][canvasId] = {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            drawings: []
          };
          // Save to database
          await saveCanvas(roomId, canvasId);
        }
      }
      socket.emit('canvasState', canvasStates[roomId][canvasId]);
    });

    // Handle drawing data
    socket.on('draw', async (data) => {
      const { roomId, canvasId, drawingData } = data;
      if (!canvasStates[roomId]) {
        canvasStates[roomId] = {};
      }
      if (!canvasStates[roomId][canvasId]) {
        canvasStates[roomId][canvasId] = {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          drawings: []
        };
      }
      // Save drawing data
      canvasStates[roomId][canvasId].drawings.push(drawingData);
      // Broadcast to other clients in the same room
      socket.to(roomId).emit('draw', { canvasId, drawingData });
      // Save to database
      await saveCanvas(roomId, canvasId);
    });

    // Handle undo action
    socket.on('undo', async (data) => {
      const { roomId, canvasId } = data;
      if (canvasStates[roomId] && 
          canvasStates[roomId][canvasId] && 
          canvasStates[roomId][canvasId].drawings.length > 0) {
        // Remove only the last drawing action
        canvasStates[roomId][canvasId].drawings.pop();
        // Broadcast undo to all clients in the same room
        io.to(roomId).emit('undo', canvasId);
        // Save to database
        await saveCanvas(roomId, canvasId);
      }
    });

    // Handle canvas clear
    socket.on('clearCanvas', async (data) => {
      const { roomId, canvasId } = data;
      if (canvasStates[roomId] && canvasStates[roomId][canvasId]) {
        canvasStates[roomId][canvasId].drawings = [];
        io.to(roomId).emit('canvasCleared', canvasId);
        // Save to database
        await saveCanvas(roomId, canvasId);
      }
    });

    // Handle new canvas creation
    socket.on('createCanvas', async (data) => {
      const { roomId, canvasId } = data;
      if (!canvasStates[roomId]) {
        canvasStates[roomId] = {};
      }
      if (!canvasStates[roomId][canvasId]) {
        canvasStates[roomId][canvasId] = {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          drawings: []
        };
        // Save to database
        await saveCanvas(roomId, canvasId);
        io.to(roomId).emit('canvasCreated', canvasId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Canvas client disconnected');
      // Notify all rooms the user was in
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id) { // socket.id is always in rooms
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  });
};
