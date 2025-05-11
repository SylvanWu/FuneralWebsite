# CS732 project - Team DeepSick

# Digital Memorial Hall

The Digital Memorial Hall is a full-stack project that allows users to upload and view images, videos, and text memories to commemorate the deceased.

## Team Members
- XingYuan Zhou _(xzho158@aucklanduni.ac.nz)_
- Weijing Zhang _(wzha211@aucklanduni.ac.nz)_
- Haoran Li _(hli598@aucklanduni.ac.nz)_
- Yue Wu _(ywu426@aucklanduni.ac.nz)_
- Huiyu Zhang _(hzha635@aucklanduni.ac.nz)_
- Can Zhao _(czha564@aucklanduni.ac.nz)_

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS
- Backend: Express.js, MongoDB, Mongoose
- File Handling: Multer

## Features

- Upload images, videos, or text as memories
- All memories displayed in reverse chronological order on a timeline
- Each memory includes uploader name, upload time, and content
- Delete memories with a confirmation prompt
- Hover over memories to see the delete button

## Installation and Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (local or remote)

### Installation Steps

1. Clone the project

```bash
git clone <repository-url>
cd digital-memorial-hall
```

2. Install dependencies

```bash
npm install
npm install socket.io-client
```

3. Configure environment variables

Create a file named `.env` and add the following content:

```
MONGO_URI=mongodb://localhost:27017/memorial
PORT=5000
```

4. Start the application

```bash
# Start the frontend development server
npm run dev

# In another terminal, start the backend server
npm run dev:server
```

The application will run on http://localhost:5173 (frontend) and http://localhost:5000 (backend API).

## API Endpoints

- `GET /memories` - Get all memories in reverse chronological order
- `POST /memories` - Create a new memory
- `DELETE /memories/:id` - Delete a specific memory by ID

## Contribution

Pull requests and Issues are welcome to improve this project.

![](./DeepSick.png) 