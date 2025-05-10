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
  const reconnectAttemptsRef = useRef(0);

  // Initialize Socket.io connection
  const initializeSocket = useCallback(() => {
    try {
      const newSocket = io('http://localhost:5001', {
        reconnectionAttempts: SOCKET_RECONNECT_ATTEMPTS,
        reconnectionDelay: SOCKET_RECONNECT_DELAY,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      newSocket.on('connect_error', (err) => {
        reconnectAttemptsRef.current += 1;
        if (reconnectAttemptsRef.current >= SOCKET_RECONNECT_ATTEMPTS) {
          setError('Failed to connect to server. Please refresh the page.');
          setIsConnected(false);
        } else {
          setError(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${SOCKET_RECONNECT_ATTEMPTS})`);
        }
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          setError('Server disconnected. Please refresh the page.');
        } else {
          setError('Network connection lost. Attempting to reconnect...');
        }
      });

      newSocket.on('error', (err) => {
        setError(`Error occurred: ${err.message}`);
      });

      // Receive canvas state
      newSocket.on('canvasState', (state: CanvasState) => {
        try {
          redrawCanvas(state.drawings);
        } catch (err) {
          console.error('Failed to redraw canvas:', err);
          setError('Failed to redraw canvas. Please refresh the page.');
        }
      });

      // Listen for drawing data from other users
      newSocket.on('draw', (data: DrawingData) => {
        try {
          drawOnCanvas(data);
        } catch (err) {
          console.error('Failed to draw:', err);
        }
      });

      // Listen for canvas clear event
      newSocket.on('canvasCleared', () => {
        try {
          initCanvas();
        } catch (err) {
          console.error('Failed to clear canvas:', err);
        }
      });

      setSocket(newSocket);

      return newSocket;
    } catch (err) {
      console.error('Failed to initialize Socket:', err);
      setError('Failed to initialize connection. Please refresh the page.');
      return null;
    }
  }, []);

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
        ctx.fillStyle = data.points[0].color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    if (currentTool === 'BRUSH' || currentTool === 'ERASER') {
      const drawingData: DrawingData = {
        points: [point],
        type: currentTool === 'ERASER' ? 'erase' : 'brush'
      };
      drawOnCanvas(drawingData);
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
        const drawingData: DrawingData = {
          points: [startPoint, currentPoint],
          type: currentTool === 'ERASER' ? 'erase' : 'brush'
        };
        drawOnCanvas(drawingData);
        setStartPoint(currentPoint);
        break;

      case 'LINE':
      case 'RECTANGLE':
      case 'CIRCLE':
        // Redraw previous canvas state
        redrawCanvas([]);
        const shapeData: DrawingData = {
          points: [startPoint, currentPoint],
          type: currentTool.toLowerCase() as DrawingData['type']
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

    if (currentTool === 'LINE' || currentTool === 'RECTANGLE' || currentTool === 'CIRCLE') {
      const drawingData: DrawingData = {
        points: [startPoint, endPoint],
        type: currentTool.toLowerCase() as DrawingData['type']
      };
      socket?.emit('draw', drawingData);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleClearCanvas = () => {
    if (socket) {
      socket.emit('clearCanvas');
    }
  };

  return (
    <div className="shared-canvas-container" ref={containerRef}>
      <div className="shared-toolbar">
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