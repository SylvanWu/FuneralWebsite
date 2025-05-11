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
import interactiveRoutes from './routes/interactiveRoutes.js';
import funeralRoutes from './routes/funeralRoutes.js';

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
    origin: 'http://localhost:5173', // Your frontend development address
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Accept-Ranges', 'Content-Range', 'Content-Length']
}));

app.use(express.json());

app.use('/uploads',
    express.static(UPLOAD_DIR, { acceptRanges: false })
);

/* ──────────── Business Routes ──────────── */
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoriesRouter);
app.use('/api/wills', willRoutes);
app.use('/api/dreams', dreamRouter);
app.use('/api/interactive', interactiveRoutes);
app.use('/api/funerals', funeralRoutes);

/* Default root route (Health check) */
app.get('/', (_, res) => res.send('Digital Memorial Hall API'));

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
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });

        // Store canvas state
        let canvasState = {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            drawings: []
        };

        // Socket.IO connection handling
        io.on('connection', (socket) => {
            console.log('Client connected');

            // Send current canvas state to newly connected client
            socket.emit('canvasState', canvasState);

            // Handle drawing data
            socket.on('draw', (data) => {
                // Save drawing data
                canvasState.drawings.push(data);
                // Broadcast to other clients
                socket.broadcast.emit('draw', data);
            });

            // Handle canvas clear
            socket.on('clearCanvas', () => {
                canvasState.drawings = [];
                io.emit('canvasCleared');
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        // Use httpServer to listen on port
        httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));