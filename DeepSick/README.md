# Digital Memorial Hall

The Digital Memorial Hall is a full-stack project that allows users to upload and view images, videos, and text memories to commemorate the deceased.

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS
- Backend: Express.js, MongoDB, Mongoose
- File Handling: Multer

## Features

- Upload images, videos, or text as memories
- All memories displayed in reverse chronological order on a timeline
- Each memory includes uploader name, upload time, and content

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

## Contribution

Pull requests and Issues are welcome to improve this project.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
