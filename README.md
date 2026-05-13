# Blog App - MERN Stack

A full-stack blog application built with the **MERN stack** (MongoDB, Express.js, React, Node.js).

## Features

- **Authentication** — Register, login, logout with JWT & bcryptjs
- **Role-based access** — User, Author, Admin roles with separate API layers
- **Article management** — Create, read, update, delete articles with categories
- **Comments** — Comment on articles
- **Image uploads** — Cloudinary integration for profile & article images
- **Responsive UI** — React frontend styled with TailwindCSS
- **State management** — Zustand for frontend state

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TailwindCSS, Zustand, React Router |
| Backend | Express.js 5, Mongoose 9 |
| Database | MongoDB |
| Auth | JSON Web Tokens, bcryptjs |
| Media | Cloudinary, Multer |
| Dev Tools | ESLint, Nodemon |

## Project Structure

```
capstone/
├── Backend/
│   ├── APIs/              # Route handlers (user, author, admin, common)
│   ├── config/            # Cloudinary, Multer setup
│   ├── middlewares/        # JWT verification middleware
│   ├── models/            # Mongoose schemas (User, Article)
│   ├── server.js          # Express app entry point
│   └── .env               # Environment variables
├── Frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand stores
│   │   └── styles/        # CSS files
│   ├── public/
│   └── .env               # Vite env vars
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally (or a cloud URI)
- Cloudinary account (optional, for image uploads)

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```
PORT=5050
DB_URL=mongodb://127.0.0.1:27017/blogapp
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SECRET_KEY=your_jwt_secret
```

Start the backend:

```bash
npm start
```

### 2. Frontend Setup

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```
VITE_API_URL=http://localhost:5050
```

Start the frontend:

```bash
npm run dev
```

### 3. Seed Data (optional)

```bash
cd Backend
node seed.js
```

The backend runs on **http://localhost:5050** and the frontend on **http://localhost:5173**.

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `/auth` | Register, login, logout |
| `/user-api` | User operations |
| `/author-api` | Author operations |
| `/admin-api` | Admin operations |
