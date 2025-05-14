# CS732 project - Team DeepSick

# Digital Memorial Hall

The Digital Memorial Hall is a full-stack project that allows users to upload and view images, videos, and text memories to commemorate the deceased.

# Project Deployment
http://13.239.225.209

## Team Members
- XingYuan Zhou _(xzho158@aucklanduni.ac.nz)_
- Weijing Zhang _(wzha211@aucklanduni.ac.nz)_
- Haoran Li _(hli598@aucklanduni.ac.nz)_
- Yue Wu _(ywu426@aucklanduni.ac.nz)_
- Huiyu Zhang _(hzha635@aucklanduni.ac.nz)_
- Can Zhao _(czha564@aucklanduni.ac.nz)_

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Konva (Canvas Operations)
- Socket.io Client
- TailwindCSS
- React Easy Crop (Image Cropping)

### Backend
- Node.js
- Express
- MongoDB
- Socket.io
- JWT (Authentication)
- Multer (File Upload)

## Features

- User Authentication System
- Create and Manage Digital Memorial Halls
- Multimedia Content Upload (Images, Videos)
- Text Memory Records
- Real-time Interactive Features
- Canvas Operations
- Responsive Design

## Project Structure

```
DeepSick/
├── src/                    # Frontend Source Code
│   ├── components/        # Reusable Components
│   ├── pages/            # Page Components
│   ├── services/         # Service Layer
│   ├── api/              # API Calls
│   ├── context/          # React Context
│   └── assets/           # Static Assets
├── server/               # Backend Source Code
│   ├── routes/          # API Routes
│   ├── models/          # Data Models
│   ├── middleware/      # Middleware
│   ├── interactive/     # Interactive Features
│   └── uploads/         # File Upload Directory
└── public/              # Static Files
```

## Deployment Guide

### Prerequisites
- Node.js (Latest LTS version recommended)
- MongoDB
- npm or yarn

### Installation Steps

1. Clone the project
```bash
git clone [project-url]
cd DeepSick
```

2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/memorial
JWT_SECRET=your_jwt_secret
```

### Running the Project

1. Start the backend server
```bash
cd server
npm run dev:server
```

2. Start the frontend development server
```bash
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- API Health Check: http://localhost:5001/api/health

## API Documentation

Main API Endpoints:
- `/api/auth` - User Authentication
- `/api/memories` - Memory Management
- `/api/wills` - Will Management
- `/api/dreams` - Dream Management
- `/api/funerals` - Funeral Management
- `/api/interactive` - Interactive Features

## Development Guide

### Development Commands
```bash
# Frontend Development
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

# Backend Development
npm run server     # Start server
npm run dev:server # Start server with nodemon (development mode)
```

### Code Standards
- ESLint for code linting
- TypeScript for type checking
- Follow React best practices

## Important Notes
- Ensure MongoDB service is running
- File upload directory requires appropriate write permissions
- Modify security configurations for production deployment

![](./image.png) 
