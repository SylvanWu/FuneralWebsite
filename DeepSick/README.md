# DeepSick Digital Memorial Hall

A comprehensive digital memorial platform that allows users to create, customize, and participate in virtual memorial spaces for honoring and remembering the deceased.

## Overview

The Digital Memorial Hall is a full-stack application designed to provide a dignified, interactive online environment for memorial services. It combines traditional memorial elements with modern digital interactions, allowing friends and family members to come together virtually to honor and remember their loved ones.

## Tech Stack

### Frontend
- **Framework**: React 18, TypeScript
- **Styling**: CSS, CSS Modules
- **State Management**: React Context API
- **Routing**: React Router v6
- **Real-time Communication**: Socket.IO Client

### Backend
- **Server**: Express.js, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer for memory uploads
- **Real-time Server**: Socket.IO

## Key Features

### Memorial Room Creation
- Custom memorial room generation with unique room IDs
- Password protection for private memorial spaces
- Customizable backgrounds and memorial themes
- Support for deceased information and memorial details

### Interactive Elements
- **Flower Offering**: Virtual flower placement to pay respects
- **Candle Lighting**: Light virtual candles in memory of the deceased
- **Message Board**: Leave condolences or memories for the family
- **Memorial Timeline**: Chronological display of all visitor interactions

### Media Features
- **Memorial Photo Hall**: Upload and display photo memories
- **Drawing Canvas**: Collaborative drawing board for memorial art
- **Music Player**: Background music for the memorial atmosphere
- **Video Tributes**: Upload and play video memories

### Additional Features
- **Farewell Will**: Record video farewell messages
- **Dream List**: Create and share unfulfilled wishes or goals of the departed
- **Interactive Layout**: Tab-based organization of memorial features
- **Responsive Design**: Works on desktop and mobile devices

## Component Structure

### Key Components
- `InteractionSection`: Central component managing all interactive features
- `MemorialHall`: Photo and video memory display component
- `SharedCanvas`: Collaborative drawing component
- `MusicPlayer`: Background music management
- `WillForm`: Video farewell message recording
- `DreamShrink`: Dream list component for unfulfilled wishes

## Installation and Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or remote)
- npm or yarn package manager

### Installation Steps

1. Clone the project
```bash
git clone https://github.com/your-username/DeepSick.git
cd DeepSick
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
Create a `.env` file in the root directory with:
```
MONGO_URI=mongodb://localhost:27017/memorialhall
PORT=5001
VITE_API_URL=http://localhost:5001/api
```

4. Start the development servers
```bash
# Start frontend development server
npm run dev
# or
yarn dev

# In another terminal, start the backend server
npm run server
# or
yarn server
```

The application will run on http://localhost:5173 (frontend) and http://localhost:5001 (backend API).

## API Endpoints

### Room Management
- `GET /api/rooms` - Retrieve all available memorial rooms
- `GET /api/rooms/:roomId` - Get details for a specific room
- `POST /api/rooms` - Create a new memorial room
- `PUT /api/rooms/:roomId` - Update room details
- `DELETE /api/rooms/:roomId` - Delete a memorial room

### Memory Management
- `GET /api/memories/:roomId` - Get all memories for a specific room
- `POST /api/memories` - Create a new memory (with file upload)
- `DELETE /api/memories/:id` - Delete a specific memory

### User Interaction
- `POST /api/interactions/flowers` - Place a virtual flower
- `POST /api/interactions/candles` - Light a virtual candle
- `POST /api/interactions/messages` - Leave a message
- `GET /api/interactions/:roomId` - Get all interactions for a room

### Will and Dreams
- `POST /api/wills` - Create a farewell will video
- `GET /api/wills/:roomId` - Get wills for a specific room
- `POST /api/dreams` - Add a dream list item
- `GET /api/dreams/:roomId` - Get dream list for a room

## User Guide

### Creating a Memorial Room
1. Navigate to the home page and select "Create Memorial Room"
2. Enter the deceased's information and choose memorial settings
3. Set a password for the room if desired
4. Share the generated room ID with friends and family

### Participating in a Memorial
1. Enter the room ID provided by the memorial organizer
2. Input the password if required
3. Navigate through the tabs to access different memorial features
4. Leave messages, flowers, candles, or other tributes as desired

## Deployment

The application can be deployed using services like:
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Heroku, DigitalOcean, AWS, or Google Cloud Platform
- **Database**: MongoDB Atlas for cloud database hosting

## Future Enhancements
- Live video memorial service integration
- Enhanced security features
- Multi-language support
- Mobile application version
- AI-enhanced memorial experience

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Thanks to all contributors and testers
- Special thanks to the open-source community for their invaluable tools and libraries
