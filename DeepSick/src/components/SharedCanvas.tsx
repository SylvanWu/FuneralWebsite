import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import './SharedCanvas.css';

interface Point {
  x: number;
  y: number;
  color: string;
  size: number;
  opacity: number;
}

interface DrawingData {
  points: Point[];
  type: 'brush' | 'erase' | 'fill' | 'line' | 'rectangle' | 'circle';
}

interface CanvasState {
  width: number;
  height: number;
  backgroundColor: string;
  drawings: DrawingData[];
}

interface CanvasStates {
  [key: string]: CanvasState;
}

const SOCKET_RECONNECT_ATTEMPTS = 5;
const SOCKET_RECONNECT_DELAY = 3000;

const TOOL_TYPES = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  FILL: 'fill',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
} as const;

// Add floodFill function
const floodFill = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string
) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const pixels = imageData.data;

  const startPos = (startY * ctx.canvas.width + startX) * 4;
  const startR = pixels[startPos];
  const startG = pixels[startPos + 1];
  const startB = pixels[startPos + 2];
  const startA = pixels[startPos + 3];

  // If the clicked position is transparent, don't fill
  if (startA === 0) return;

  const fillColorRGB = hexToRgb(fillColor);
  if (!fillColorRGB) return;

  const stack: [number, number][] = [[startX, startY]];
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const pos = (y * width + x) * 4;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (
      pixels[pos] !== startR ||
      pixels[pos + 1] !== startG ||
      pixels[pos + 2] !== startB ||
      pixels[pos + 3] !== startA
    ) continue;

    pixels[pos] = fillColorRGB.r;
    pixels[pos + 1] = fillColorRGB.g;
    pixels[pos + 2] = fillColorRGB.b;
    pixels[pos + 3] = 255;

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
};

// Helper function: Convert hex color to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const SharedCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [currentTool, setCurrentTool] = useState<keyof typeof TOOL_TYPES>('BRUSH');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [drawings, setDrawings] = useState<DrawingData[]>([]);
  const drawingsRef = useRef<DrawingData[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [currentCanvasId, setCurrentCanvasId] = useState('default');
  const [canvasList, setCanvasList] = useState<string[]>(['default']);
  const [newCanvasName, setNewCanvasName] = useState('');
  const reconnectAttemptsRef = useRef(0);

  // Update drawings when it changes
  const updateDrawings = useCallback((newDrawings: DrawingData[]) => {
    setDrawings(newDrawings);
    drawingsRef.current = newDrawings;
  }, []);

  // Initialize Socket.io connection
  const initializeSocket = useCallback(() => {
    if (socket) return socket;

    try {
      const newSocket = io('http://localhost:5001', {
        reconnectionAttempts: SOCKET_RECONNECT_ATTEMPTS,
        reconnectionDelay: SOCKET_RECONNECT_DELAY,
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

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      newSocket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        reconnectAttemptsRef.current += 1;
        if (reconnectAttemptsRef.current >= SOCKET_RECONNECT_ATTEMPTS) {
          setError('Failed to connect to server. Please refresh the page.');
          setIsConnected(false);
        } else {
          setError(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${SOCKET_RECONNECT_ATTEMPTS})`);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          setError('Server disconnected. Please refresh the page.');
        } else if (reason === 'transport close') {
          setError('Connection lost. Attempting to reconnect...');
        } else if (reason === 'ping timeout') {
          setError('Connection timeout. Attempting to reconnect...');
        } else {
          setError('Network connection lost. Attempting to reconnect...');
        }
      });

      newSocket.on('error', (err) => {
        console.error('Socket error:', err);
        setError(`Error occurred: ${err.message}`);
      });

      // Receive canvas states
      newSocket.on('canvasStates', (states: CanvasStates) => {
        try {
          console.log('Received canvas states:', states);
          setCanvasList(Object.keys(states));
          if (states[currentCanvasId]) {
            redrawCanvas(states[currentCanvasId].drawings);
          }
        } catch (err) {
          console.error('Failed to redraw canvas:', err);
          setError('Failed to redraw canvas. Please refresh the page.');
        }
      });

      // Receive canvas state
      newSocket.on('canvasState', (state: CanvasState) => {
        try {
          console.log('Received canvas state:', state);
          redrawCanvas(state.drawings);
          updateDrawings(state.drawings);
        } catch (err) {
          console.error('Failed to redraw canvas:', err);
          setError('Failed to redraw canvas. Please refresh the page.');
        }
      });

      // Listen for drawing data from other users
      newSocket.on('draw', (data: { canvasId: string; drawingData: DrawingData }) => {
        try {
          console.log('Received drawing data:', data);
          if (data.canvasId === currentCanvasId) {
            drawOnCanvas(data.drawingData);
            updateDrawings([...drawingsRef.current, data.drawingData]);
          }
        } catch (err) {
          console.error('Failed to draw:', err);
        }
      });

      // Listen for canvas clear event
      newSocket.on('canvasCleared', (canvasId: string) => {
        try {
          console.log('Canvas cleared:', canvasId);
          if (canvasId === currentCanvasId) {
            initCanvas();
            updateDrawings([]);
          }
        } catch (err) {
          console.error('Failed to clear canvas:', err);
        }
      });

      // Listen for canvas creation
      newSocket.on('canvasCreated', (canvasId: string) => {
        console.log('Canvas created:', canvasId);
        setCanvasList(prev => [...prev, canvasId]);
      });

      // Listen for undo event
      newSocket.on('undo', (canvasId: string) => {
        console.log('Undo event:', canvasId);
        if (canvasId === currentCanvasId && drawingsRef.current.length > 0) {
          const newDrawings = drawingsRef.current.slice(0, -1);
          updateDrawings(newDrawings);
          redrawCanvas(newDrawings);
        }
      });

      setSocket(newSocket);
      return newSocket;
    } catch (err) {
      console.error('Failed to initialize Socket:', err);
      setError('Failed to initialize connection. Please refresh the page.');
      return null;
    }
  }, [currentCanvasId, updateDrawings]);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (err) {
      console.error('Failed to initialize canvas:', err);
      setError('Failed to initialize canvas. Please refresh the page.');
    }
  }, []);

  // Redraw canvas
  const redrawCanvas = useCallback((drawings: DrawingData[]) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Redraw all drawings
      drawings.forEach(drawing => {
        drawOnCanvas(drawing);
      });
    } catch (err) {
      console.error('Failed to redraw canvas:', err);
      setError('Failed to redraw canvas. Please refresh the page.');
    }
  }, []);

  // Calculate canvas scale
  const calculateScale = useCallback(() => {
    try {
      if (!containerRef.current || !canvasRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const canvasWidth = canvasRef.current.width;
      const newScale = Math.min(1, containerWidth / canvasWidth);
      setScale(newScale);
    } catch (err) {
      console.error('Failed to calculate scale:', err);
    }
  }, []);

  // Get coordinates relative to canvas
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      return { x, y };
    } catch (err) {
      console.error('Failed to calculate coordinates:', err);
      return { x: 0, y: 0 };
    }
  }, [scale]);

  useEffect(() => {
    // Initialize canvas
    initCanvas();

    // Initialize Socket.io connection
    const socket = initializeSocket();

    // Listen for window resize
    window.addEventListener('resize', calculateScale);
    calculateScale();

    return () => {
      socket?.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [initCanvas, initializeSocket, calculateScale]);

  const drawOnCanvas = (data: DrawingData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalAlpha = data.points[0].opacity;
    ctx.strokeStyle = data.type === 'erase' ? '#ffffff' : data.points[0].color;
    ctx.lineWidth = data.points[0].size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (data.type) {
      case 'brush':
      case 'erase':
        ctx.beginPath();
        data.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        break;

      case 'line':
        if (data.points.length === 2) {
          ctx.beginPath();
          ctx.moveTo(data.points[0].x, data.points[0].y);
          ctx.lineTo(data.points[1].x, data.points[1].y);
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (data.points.length === 2) {
          const width = data.points[1].x - data.points[0].x;
          const height = data.points[1].y - data.points[0].y;
          ctx.strokeRect(data.points[0].x, data.points[0].y, width, height);
        }
        break;

      case 'circle':
        if (data.points.length === 2) {
          const radius = Math.sqrt(
            Math.pow(data.points[1].x - data.points[0].x, 2) +
            Math.pow(data.points[1].y - data.points[0].y, 2)
          );
          ctx.beginPath();
          ctx.arc(data.points[0].x, data.points[0].y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'fill':
        floodFill(ctx, Math.round(data.points[0].x), Math.round(data.points[0].y), data.points[0].color);
        break;
    }

    ctx.globalAlpha = 1;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);

    const point: Point = {
      x,
      y,
      color: currentColor,
      size: brushSize,
      opacity
    };

    setStartPoint(point);
    setCurrentPath([point]);

    if (currentTool === 'BRUSH' || currentTool === 'ERASER') {
      const drawingData: DrawingData = {
        points: [point],
        type: currentTool === 'ERASER' ? 'erase' : 'brush'
      };
      drawOnCanvas(drawingData);
    } else if (currentTool === 'FILL') {
      const drawingData: DrawingData = {
        points: [point],
        type: 'fill'
      };
      drawOnCanvas(drawingData);
      updateDrawings([...drawingsRef.current, drawingData]);
      socket?.emit('draw', { canvasId: currentCanvasId, drawingData });
      setIsDrawing(false);
      setStartPoint(null);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const { x, y } = getCanvasCoordinates(e);
    const currentPoint: Point = {
      x,
      y,
      color: currentColor,
      size: brushSize,
      opacity
    };

    switch (currentTool) {
      case 'BRUSH':
      case 'ERASER':
        setCurrentPath([...currentPath, currentPoint]);
        const drawingData: DrawingData = {
          points: [...currentPath, currentPoint],
          type: currentTool === 'ERASER' ? 'erase' : 'brush'
        };
        drawOnCanvas(drawingData);
        setStartPoint(currentPoint);
        break;

      case 'LINE':
      case 'RECTANGLE':
      case 'CIRCLE':
        // Redraw previous canvas state with all saved drawings
        redrawCanvas(drawings);
        const shapeData: DrawingData = {
          points: [startPoint, currentPoint],
          type: TOOL_TYPES[currentTool] as DrawingData['type']
        };
        drawOnCanvas(shapeData);
        break;
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const { x, y } = getCanvasCoordinates(e);
    const endPoint: Point = {
      x,
      y,
      color: currentColor,
      size: brushSize,
      opacity
    };

    if (currentTool === 'BRUSH' || currentTool === 'ERASER') {
      const drawingData: DrawingData = {
        points: [...currentPath, endPoint],
        type: currentTool === 'ERASER' ? 'erase' : 'brush'
      };
      updateDrawings([...drawingsRef.current, drawingData]);
      socket?.emit('draw', { canvasId: currentCanvasId, drawingData });
      setCurrentPath([]);
    } else if (currentTool === 'LINE' || currentTool === 'RECTANGLE' || currentTool === 'CIRCLE') {
      const drawingData: DrawingData = {
        points: [startPoint, endPoint],
        type: TOOL_TYPES[currentTool] as DrawingData['type']
      };
      updateDrawings([...drawingsRef.current, drawingData]);
      socket?.emit('draw', { canvasId: currentCanvasId, drawingData });
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  // Handle canvas selection
  const handleCanvasSelect = (canvasId: string) => {
    setCurrentCanvasId(canvasId);
    socket?.emit('selectCanvas', canvasId);
  };

  // Handle new canvas creation
  const handleCreateCanvas = () => {
    if (newCanvasName && !canvasList.includes(newCanvasName)) {
      socket?.emit('createCanvas', newCanvasName);
      setNewCanvasName('');
    }
  };

  // Handle undo functionality
  const handleUndo = useCallback(() => {
    if (drawingsRef.current.length > 0) {
      socket?.emit('undo', currentCanvasId);
    }
  }, [socket, currentCanvasId]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo]);

  // Handle canvas clear
  const handleClearCanvas = () => {
    if (socket) {
      socket.emit('clearCanvas', currentCanvasId);
    }
  };

  return (
    <div className="shared-canvas-container" ref={containerRef}>
      <div className="shared-toolbar">
        <div className="shared-tool-group">
          <select
            value={currentCanvasId}
            onChange={(e) => handleCanvasSelect(e.target.value)}
            className="canvas-select"
          >
            {canvasList.map((canvasId) => (
              <option key={canvasId} value={canvasId}>
                Canvas {canvasId}
              </option>
            ))}
          </select>
          <div className="new-canvas-input">
            <input
              type="text"
              value={newCanvasName}
              onChange={(e) => setNewCanvasName(e.target.value)}
              placeholder="New canvas name"
            />
            <button
              className="shared-tool-button"
              onClick={handleCreateCanvas}
              title="Create New Canvas"
            >
              ➕
            </button>
          </div>
        </div>

        <div className="shared-tool-group">
          <button
            className={`shared-tool-button ${currentTool === 'BRUSH' ? 'active' : ''}`}
            onClick={() => setCurrentTool('BRUSH')}
            title="Brush"
          >
            ✏️
          </button>
          <button
            className={`shared-tool-button ${currentTool === 'ERASER' ? 'active' : ''}`}
            onClick={() => setCurrentTool('ERASER')}
            title="Eraser"
          >
            🧹
          </button>
          <button
            className={`shared-tool-button ${currentTool === 'FILL' ? 'active' : ''}`}
            onClick={() => setCurrentTool('FILL')}
            title="Fill"
          >
            🎨
          </button>
          <button
            className={`shared-tool-button ${currentTool === 'LINE' ? 'active' : ''}`}
            onClick={() => setCurrentTool('LINE')}
            title="Line"
          >
            📏
          </button>
          <button
            className={`shared-tool-button ${currentTool === 'RECTANGLE' ? 'active' : ''}`}
            onClick={() => setCurrentTool('RECTANGLE')}
            title="Rectangle"
          >
            ⬜
          </button>
          <button
            className={`shared-tool-button ${currentTool === 'CIRCLE' ? 'active' : ''}`}
            onClick={() => setCurrentTool('CIRCLE')}
            title="Circle"
          >
            ⭕
          </button>
        </div>

        <div className="shared-tool-group">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            title="Color"
          />
          <div className="shared-slider-container">
            <span className="shared-slider-label">Size</span>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              title="Brush Size"
            />
          </div>
          <div className="shared-slider-container">
            <span className="shared-slider-label">Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              title="Opacity"
            />
          </div>
        </div>

        <div className="shared-tool-group">
          <button
            className="shared-tool-button"
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
          >
            ↩️
          </button>
          <button
            className="shared-tool-button"
            onClick={handleClearCanvas}
            title="Clear Canvas"
          >
            🗑️
          </button>
          <button
            className="shared-tool-button"
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                const link = document.createElement('a');
                link.download = 'drawing.png';
                link.href = canvas.toDataURL();
                link.click();
              }
            }}
            title="Save"
          >
            💾
          </button>
        </div>
      </div>

      {error && <div className="shared-error-message">{error}</div>}
      
      <div className="shared-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={1024}
          height={768}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            cursor: 'crosshair'
          }}
        />
      </div>
    </div>
  );
};

export default SharedCanvas; 