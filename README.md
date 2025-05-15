# DeepSick Digital Memorial Hall

A comprehensive digital memorial platform that allows users to create, customize, and participate in virtual memorial spaces for honoring and remembering the deceased.


## Overview

DeepSick Digital Memorial Hall is a full-stack web application designed to provide a dignified, interactive online environment for memorial services. Our platform combines traditional memorial elements with modern digital interactions, creating a space where friends and family members can come together virtually to honor and remember their loved ones.

In today's increasingly digital world, we recognize the need for memorial services that can transcend geographical limitations while maintaining the solemnity and respect of traditional ceremonies. Our platform aims to fill this gap by offering a comprehensive digital solution for memorial services.

## Team Members
- XingYuan Zhou _(xzho158@aucklanduni.ac.nz)_
- Weijing Zhang _(wzha211@aucklanduni.ac.nz)_
- Haoran Li _(hli598@aucklanduni.ac.nz)_
- Yue Wu _(ywu426@aucklanduni.ac.nz)_
- Huiyu Zhang _(hzha635@aucklanduni.ac.nz)_
- Can Zhao _(czha564@aucklanduni.ac.nz)_

## Features

### Memorial Room Creation and Management
- Create customized memorial spaces with unique room IDs
- Password protection for private memorial rooms
- Personalize with customizable backgrounds and memorial themes
- Comprehensive deceased information display
- Organizer dashboard for memorial management

### Interactive Memorial Elements
- **Virtual Flower Offering**: Place digital flowers at the memorial
- **Virtual Candle Lighting**: Light digital candles in remembrance
- **Message Board**: Leave condolences and share memories
- **Memorial Timeline**: Chronological display of all visitor interactions
- **Real-time Collaboration**: Multiple visitors can interact simultaneously

### Media Management
- **Memorial Photo Hall**: Upload and display cherished photographic memories
- **Collaborative Drawing Canvas**: Create memorial art together
- **Background Music**: Set the ambiance with appropriate music
- **Video Tributes**: Upload and play video memories

### Personal Legacy Features
- **Farewell Will**: Record and share video farewell messages
- **Dream List**: Document and share unfulfilled wishes or goals of the departed
- **Interactive Memorial Layout**: Tab-based organization of memorial features
- **Responsive Design**: Full functionality on both desktop and mobile devices

### User System
- **Role-based Access Control**: Different permissions for organizers and visitors
- **User Profiles**: Personalized user experiences
- **Secure Authentication**: JWT-based security system

## Tech Stack

### Frontend
- **Core**: React 18 with TypeScript
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **Text Editing**: TipTap rich text editor
- **Drawing**: React Konva for canvas interactions
- **State Management**: React Context API
- **Styling**: CSS Modules and custom styling
- **Real-time Communication**: Socket.IO Client

### Backend
- **Server**: Express.js running on Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt
- **File Storage**: Multer for handling media uploads
- **Real-time Server**: Socket.IO
- **Logging**: Morgan

### Development & Testing
- **Build Tool**: Vite
- **Testing**: Vitest for unit tests, Cypress for E2E testing
- **Linting**: ESLint
- **Type Checking**: TypeScript

## Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. Clone the repository
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

3. Set up environment variables
Create a `.env` file in the /server directory with the following variables:
```
MONGO_URI=mongodb://localhost:27017/deepsick
PORT=5001
JWT_SECRET=your_jwt_secret_key
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

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

### Testing

The project includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run frontend tests with watch mode
npm run test:watch

# Run test coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run API tests
npm run test:api
```

## Usage Guide

### For Memorial Organizers

1. **Create an Account**
   - Register as an organizer
   - Verify your email address

2. **Create a Memorial Room**
   - Provide information about the deceased
   - Upload a profile photo
   - Choose memorial theme and settings
   - Set privacy options (public or password-protected)

3. **Customize the Memorial**
   - Upload photos and videos
   - Add biographical information
   - Record farewell will videos
   - Add dream list items
   - Configure background music

4. **Share Access**
   - Distribute the unique room ID
   - Share the access password (if protected)
   - Invite friends and family via email

5. **Monitor and Moderate**
   - View visitor interactions
   - Moderate messages
   - Update memorial content

### For Memorial Visitors

1. **Access a Memorial**
   - Enter the room ID provided by the organizer
   - Input access password if required

2. **Pay Respects**
   - Light virtual candles
   - Place virtual flowers
   - Leave condolence messages
   - View the memorial photo hall
   - Participate in the shared drawing canvas

3. **Engage with the Community**
   - View messages from other visitors
   - See the memorial timeline
   - Participate in group remembrance

## API Reference

The DeepSick platform provides a comprehensive REST API:

### Authentication Endpoints
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user and receive token
- `GET /api/auth/profile` - Get current user profile

### Memorial Room Endpoints
- `GET /api/rooms` - List all accessible memorial rooms
- `GET /api/rooms/:roomId` - Get details for a specific room
- `POST /api/rooms` - Create a new memorial room
- `PUT /api/rooms/:roomId` - Update room details
- `DELETE /api/rooms/:roomId` - Delete a memorial room

### Memorial Content Endpoints
- `GET /api/memories/:roomId` - Get all media memories for a room
- `POST /api/memories` - Upload a new memory (image/video)
- `DELETE /api/memories/:id` - Remove a specific memory
- `POST /api/wills` - Create a farewell will video
- `GET /api/wills/:roomId` - Get farewell wills for a room
- `POST /api/dreams` - Add a dream list item
- `GET /api/dreams/:roomId` - Get dream list for a room

### Interactive Feature Endpoints
- `POST /api/interactions/flowers` - Place a virtual flower
- `POST /api/interactions/candles` - Light a virtual candle
- `POST /api/interactions/messages` - Leave a message
- `GET /api/interactions/:roomId` - Get all interactions for a room

## Deployment

The application can be deployed using various services:

### Frontend Deployment
- Vercel
- Netlify
- GitHub Pages

### Backend Deployment
- Heroku
- DigitalOcean
- AWS Elastic Beanstalk
- Google Cloud Run

### Database
- MongoDB Atlas

## Roadmap

Future enhancements planned for the DeepSick Digital Memorial Hall:

- Live video memorial service streaming
- AR/VR memorial experiences
- AI-powered memorial assistance
- Multi-language support for global accessibility
- Mobile application versions (iOS and Android)
- Enhanced analytics for memorial organizers
- Integration with funeral home services

## Contributing

We welcome contributions to the DeepSick Digital Memorial Hall project. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our style guidelines and passes all tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The open-source community for providing invaluable tools and libraries
- All contributors and testers who have helped shape this project
- Feedback from funeral directors and memorial service professionals
- The families who have trusted our platform for their memorial needs
