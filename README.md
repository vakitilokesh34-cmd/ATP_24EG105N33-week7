# Capstone Blog Application

This repository contains a full-stack MERN (MongoDB, Express, React, Node.js) application for a blogging platform. It supports multiple user roles (Admin, Author, User), article creation and management, image uploads via Cloudinary, and secure authentication.

## Project Structure

The project is divided into two main directories:
- `Backend/`: The Express.js server, REST APIs, and MongoDB models.
- `Frontend/`: The React.js application using Vite, with state management and routing.

## File Descriptions

### Backend

**APIs (Controllers/Routes)**
- `Backend/APIs/articleApi.js`: Manages article-related routes, including fetching, creating, editing, and deleting articles.
- `Backend/APIs/authorApi.js`: Handles author-specific endpoints, such as retrieving an author's articles.
- `Backend/APIs/userApi.js`: Manages user authentication (login, register) and user profile data.

**Configuration & Middlewares**
- `Backend/config/cloudinary.js`: Sets up the Cloudinary connection using environment variables for media storage.
- `Backend/config/cloudinaryUpload.js`: Integrates Cloudinary with Multer for direct cloud uploads.
- `Backend/config/multer.js`: General setup for Multer to handle multipart/form-data (file uploads).
- `Backend/middlewares/verifyToken.js`: Express middleware to validate JWTs and secure protected routes.

**Models (Mongoose Schemas)**
- `Backend/models/articleModel.js`: Defines the data structure for Articles in MongoDB.
- `Backend/models/userModel.js`: Defines the data structure for Users, distinguishing between roles like Author, Admin, and User.

**Core Files**
- `Backend/server.js`: The entry point of the backend application. Connects to the database and initializes Express routes.
- `Backend/seed.js`: A utility script to populate the database with initial dummy data.

### Frontend

**Components**
- `AdminProfile.jsx`: Dashboard tailored for administrative users to manage platform content.
- `ArticleByID.jsx`: Fetches and displays the full content of a specific article.
- `Articles.jsx`: Renders a list or grid of articles available on the platform.
- `AuthorArticles.jsx`: Shows a filtered list of articles written by a specific author.
- `AuthorProfile.jsx`: The dashboard for authors to manage their own articles.
- `EditArticle.jsx`: A form allowing authors or admins to modify existing articles.
- `Footer.jsx` & `Header.jsx`: Common layout components for site navigation and footer details.
- `Home.jsx`: The main landing page of the application.
- `Login.jsx` & `Register.jsx`: Forms for user authentication and onboarding.
- `ProtectedRoute.jsx`: A wrapper component that redirects unauthenticated users away from private routes.
- `RootLayout.jsx`: Defines the shared layout structure (Header, Content, Footer) across different routes.
- `Unauthorized.jsx`: The page shown when a user attempts to access a restricted route without proper permissions.
- `UserProfile.jsx`: Standard dashboard for regular users to view their interactions or saved content.
- `WriteArticles.jsx`: A rich text editor or form for authors to draft and publish new articles.

**State & Config**
- `src/store/authStore.js`: Global state management for user authentication sessions.
- `src/styles/common.js`: Reusable styling utilities and theme variables.
- `src/App.jsx`: The root React component that sets up React Router for navigation.
- `src/main.jsx`: The application entry point that mounts the React app to the HTML DOM.

## Getting Started
1. Navigate to `Backend/` and run `npm install`, then `node server.js` (or `npm run dev`).
2. Navigate to `Frontend/` and run `npm install`, then `npm run dev` to start the Vite server.
