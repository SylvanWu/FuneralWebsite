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

/* ──────────── Common Middleware ──────────── */
app.use(cors({
    origin: ['http://localhost:5173', 'http://13.239.225.209'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Accept-Ranges', 'Content-Range', 'Content-Length'],
    credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

app.use('/uploads',
    express.static(UPLOAD_DIR, { acceptRanges: false })
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

/* Error handler middleware */
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

/* ──────────── Connect to MongoDB and Start Server ──────────── */
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/memorial')
    .then(() => {
        console.log('Connected to MongoDB');

        // Create HTTP server
        const httpServer = createServer(app);

        // Initialize Socket.IO
        const io = new Server(httpServer, {
            cors: {
                origin: ['http://localhost:5173', 'http://13.239.225.209'],
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