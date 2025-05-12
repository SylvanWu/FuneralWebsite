import { Server } from 'socket.io';
import Canvas from '../models/Canvas.js';

// Interface for canvas state
const canvasStates = {};

// Initialize Canvas Socket.IO handler
export const initializeCanvasSocket = (io) => {
  // Load all canvases from the database
  const loadCanvases = async () => {
    try {
      const canvases = await Canvas.find();
      canvases.forEach(canvas => {
        canvasStates[canvas.canvasId] = {
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
  const saveCanvas = async (canvasId) => {
    try {
      const canvasData = canvasStates[canvasId];
      await Canvas.findOneAndUpdate(
        { canvasId },
        {
          canvasId,
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

    // Send current canvas states to the newly connected client
    socket.emit('canvasStates', canvasStates);

    // Handle canvas selection
    socket.on('selectCanvas', async (canvasId) => {
      if (!canvasStates[canvasId]) {
        // Try to load from database
        const canvas = await Canvas.findOne({ canvasId });
        if (canvas) {
          canvasStates[canvasId] = {
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            drawings: canvas.drawings
          };
        } else {
          // Create new canvas
          canvasStates[canvasId] = {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            drawings: []
          };
          // Save to database
          await saveCanvas(canvasId);
        }
      }
      socket.emit('canvasState', canvasStates[canvasId]);
    });

    // Handle drawing data
    socket.on('draw', async (data) => {
      const { canvasId, drawingData } = data;
      if (!canvasStates[canvasId]) {
        canvasStates[canvasId] = {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          drawings: []
        };
      }
      // Save drawing data
      canvasStates[canvasId].drawings.push(drawingData);
      // Broadcast to other clients
      socket.broadcast.emit('draw', { canvasId, drawingData });
      // Save to database
      await saveCanvas(canvasId);
    });

    // Handle undo action
    socket.on('undo', async (canvasId) => {
      if (canvasStates[canvasId] && canvasStates[canvasId].drawings.length > 0) {
        // Remove only the last drawing action
        canvasStates[canvasId].drawings.pop();
        // Broadcast undo to all clients
        io.emit('undo', canvasId);
        // Save to database
        await saveCanvas(canvasId);
      }
    });

    // Handle canvas clear
    socket.on('clearCanvas', async (canvasId) => {
      if (canvasStates[canvasId]) {
        canvasStates[canvasId].drawings = [];
        io.emit('canvasCleared', canvasId);
        // Save to database
        await saveCanvas(canvasId);
      }
    });

    // Handle new canvas creation
    socket.on('createCanvas', async (canvasId) => {
      if (!canvasStates[canvasId]) {
        canvasStates[canvasId] = {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          drawings: []
        };
        // Save to database
        await saveCanvas(canvasId);
        io.emit('canvasCreated', canvasId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Canvas client disconnected');
    });
  });
};
