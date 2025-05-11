import { Server } from 'socket.io';
import Canvas from '../models/Canvas.js';

// 画布状态接口
const canvasStates = {};

// 初始化画布 Socket.IO 处理
export const initializeCanvasSocket = (io) => {
  // 从数据库加载所有画布
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

  // 保存画布到数据库
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

  // 初始加载画布
  loadCanvases();

  io.on('connection', (socket) => {
    console.log('Canvas client connected');

    // 发送当前画布状态给新连接的客户端
    socket.emit('canvasStates', canvasStates);

    // 处理画布选择
    socket.on('selectCanvas', async (canvasId) => {
      if (!canvasStates[canvasId]) {
        // 尝试从数据库加载
        const canvas = await Canvas.findOne({ canvasId });
        if (canvas) {
          canvasStates[canvasId] = {
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            drawings: canvas.drawings
          };
        } else {
          // 创建新画布
          canvasStates[canvasId] = {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            drawings: []
          };
          // 保存到数据库
          await saveCanvas(canvasId);
        }
      }
      socket.emit('canvasState', canvasStates[canvasId]);
    });

    // 处理绘图数据
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
      // 保存绘图数据
      canvasStates[canvasId].drawings.push(drawingData);
      // 广播给其他客户端
      socket.broadcast.emit('draw', { canvasId, drawingData });
      // 保存到数据库
      await saveCanvas(canvasId);
    });

    // 处理撤销操作
    socket.on('undo', async (canvasId) => {
      if (canvasStates[canvasId] && canvasStates[canvasId].drawings.length > 0) {
        // 只移除最后一个绘图操作
        canvasStates[canvasId].drawings.pop();
        // 广播撤销操作给所有客户端
        io.emit('undo', canvasId);
        // 保存到数据库
        await saveCanvas(canvasId);
      }
    });

    // 处理画布清除
    socket.on('clearCanvas', async (canvasId) => {
      if (canvasStates[canvasId]) {
        canvasStates[canvasId].drawings = [];
        io.emit('canvasCleared', canvasId);
        // 保存到数据库
        await saveCanvas(canvasId);
      }
    });

    // 处理新画布创建
    socket.on('createCanvas', async (canvasId) => {
      if (!canvasStates[canvasId]) {
        canvasStates[canvasId] = {
          width: 800,
          height: 600,
          backgroundColor: '#ffffff',
          drawings: []
        };
        // 保存到数据库
        await saveCanvas(canvasId);
        io.emit('canvasCreated', canvasId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Canvas client disconnected');
    });
  });
}; 