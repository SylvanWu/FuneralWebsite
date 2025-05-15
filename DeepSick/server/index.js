// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Server } from 'socket.io';
import { createServer } from 'http';
import multer from 'multer';
/* Routes */
import authRoutes from './routes/auth.js';
import memoriesRouter from './routes/memories.js';
import willRoutes from './routes/willRoutes.js';
import dreamRouter from './routes/dreamRoutes.js';
import funeralRoutes from './routes/funeralRoutes.js';
import interactiveRoutes from './interactive/interactiveRoutes.js';
import { initializeCanvasSocket } from './interactive/interactiveCanvas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));
// Unified upload directory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true }); // Ensure directory exists

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'debug-' + uniqueSuffix + path.extname(file.originalname || '.txt'));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

/* ──────────── Common Middleware ──────────── */
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://13.239.225.209', 'http://13.239.225.209:5173', 'http://13.239.225.209:5001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With', 'Origin', 'Accept'],
    exposedHeaders: ['Accept-Ranges', 'Content-Range', 'Content-Length'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Additional OPTIONS handler for preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// 确保uploads目录正确挂载为静态资源
console.log('[SERVER] 设置静态文件服务: uploads目录路径:', UPLOAD_DIR);
app.use('/uploads',
    express.static(UPLOAD_DIR, { 
      acceptRanges: false,
      immutable: true,
      maxAge: '1d',
      index: false,
      fallthrough: false
    })
);

/* ──────────── Business Routes ──────────── */
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoriesRouter);
app.use('/api/wills', willRoutes);
app.use('/api/dreams', dreamRouter);
app.use('/api/funerals', funeralRoutes);
app.use('/api/interactive', interactiveRoutes);
app.use('/auth', authRoutes);

/* Health check endpoint */
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        api: {
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        }
    };

    res.status(200).json(healthStatus);
});

/* Default root route (Health check) */
app.get('/', (_, res) => res.send('Digital Memorial Hall API'));

/* 404 handler for unmatched routes */
app.use((req, res, next) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: 404,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

/* Error handler middleware */
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    
    // Log detailed error information
    console.error({
        url: req.originalUrl,
        method: req.method,
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        body: req.body
    });
    
    // Don't expose stack traces in production
    const errorDetails = process.env.NODE_ENV === 'production' ? {} : { stack: err.stack };
    
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        status: err.status || 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        ...errorDetails
    });
});

/* ──────────── Connect to MongoDB and Start Server ──────────── */
// More detailed connection options for MongoDB
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Wait 10 seconds before timing out
    family: 4, // Use IPv4, avoid IPv6 issues
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 1, // Maintain at least 1 socket connection
};

console.log('Attempting to connect to MongoDB at:', process.env.MONGO_URI || 'mongodb://localhost:27017/memorial');

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/memorial', mongoOptions)
    .then(() => {
        console.log('Connected to MongoDB successfully');

        // Set up mongoose debug logging in development
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }

        // Handle MongoDB connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Handle process termination - close database connection
        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                console.log('MongoDB connection closed due to app termination');
                process.exit(0);
            });
        });

        // Create HTTP server
        const httpServer = createServer(app);

        // Initialize Socket.IO
        const io = new Server(httpServer, {
            cors: {
                origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://13.239.225.209', 'http://13.239.225.209:5173', 'http://13.239.225.209:5001'],
                methods: ["GET", "POST"],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000,
            transports: ['websocket', 'polling'],
            allowEIO3: true,
            maxHttpBufferSize: 1e8,
            connectTimeout: 45000,
            upgradeTimeout: 30000,
            allowUpgrades: true,
            perMessageDeflate: {
                threshold: 2048
            }
        });

        // Add error handling for Socket.IO
        io.engine.on("connection_error", (err) => {
            console.log('Socket.IO connection error:', err);
        });

        io.engine.on("upgrade_error", (err) => {
            console.log('Socket.IO upgrade error:', err);
        });

        // Initialize canvas socket handlers
        initializeCanvasSocket(io);

        // Use httpServer to listen on port
        httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

function validateEnv() {
    const required = ['JWT_SECRET', 'PORT', 'MONGO_URI'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        process.exit(1);
    }
}

validateEnv();