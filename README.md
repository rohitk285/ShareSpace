# ShareSpace - Spider Lateral Inductions - Application Development

## Overview

ShareSpace is a comprehensive full-stack web application designed to facilitate real-time communication, collaboration, and file management. It features encrypted peer-to-peer and group messaging, real-time collaborative document editing, and robust file storage, management, and sharing capabilities. Leveraging WebSockets, the application ensures seamless real-time interactions, enhancing user experience and efficiency.

To prioritize security, ShareSpace incorporates a robust authentication system with JWT and Google OAuth integration. The application has been containerized using Docker for consistent deployment and scalability. Additionally, load balancing is implemented across three servers using Nginx, ensuring efficient traffic management and optimal performance under high loads.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Features](#features-implemented)
- [Purpose](#purpose)
- [Tech Stack](#tech-stack-used)
- [Known Issues](#known-issues)

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Compass or Atlas)
- Google Cloud Console account - Google Drive API (for file uploads)
- Docker Desktop (if using Docker to run code)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/rohitk285/ShareSpace.git
   cd ShareSpace
   ```

2. **Server Setup**
   ```bash
   cd backend
   npm install
   ```
   - If you are using Docker to run application, running the above command is not necessary.

3. **Client Setup**

   ```bash
   cd frontend
   npm install
   ```
   - If you are using Docker to run application, running the above command is not necessary.

4. **Environment Variables**
   1. **Create a `.env` file in the `backend` folder and add the following variables:**

      ```env
      PORT=<your-port-number>
      MONGODB_URI=<your_mongodb_uri>
      JWT_SECRET=<your-jwt-secret>
      GOOGLE_CLIENT_ID=<your-google-client-id>
      GOOGLE_CLIENT_SECRET=<your-google-client-secret>
      SESSION_SECRET=<your-session-secret>
      SERVICE_ACCOUNT_FILE=<path-to-your-service-account-file>
      ```

      - Use PORT=3000 if using docker. If docker is not being used to run the app, use PORT=8080.
      - Use your mongodb connection string as your MONGODB_URI
      - Use any complex string as your JWT secret (eg. JWT_SECRET=as23de55f21ef59yz32) 

   2. **Create a `.env` file in the `frontend` folder and add the following variable:**

      ```env
      VITE_SECRET_KEY=<your-secret-key>
      ```

      - VITE_SECRET_KEY is used for encryption using crypto.js.
      - Use any complex string as your secret key (eg. VITE_SECRET_KEY=as23de55f21ef59yz32)

5. **Run the Application**
   1. **With Docker Desktop**
      - Build the Docker image and run the container:
      ```bash
      docker-compose up --build -d
      ```

      - Then open http://localhost:5173/ to see the locally run application.
      - Make sure Docker Desktop is downloaded and configured before running the above command.
   
   2. **Without Docker Desktop**
      - Start the server:
      ```bash
      cd backend
      node server
      ```
      - Start the client:
      ```bash
      cd frontend
      npm run dev
      ```

## Features implemented

1. User Authentication system with JWT (Level 1).
2. Real Time Chat System with web sockets (Level 1).
3. File Storage and Sharing (Level 1).
4. Collaborative Document Editing (Level 1).
5. OAuth/ SSO integration (Level 1).
6. Video Conferencing using webRTC (Level 2).
7. Containerization using Docker Desktop (Level 2).
8. Load Balancing and proxying using Nginx (Level 2).
9. Notification system using web sockets (Level 2).
10. RBAC to manage user permissions (View-Only and Editor) in document collaboration (Level 2).
11. End-to-End Encryption for chat messages using crypto.js (Level 3).
12. User Presence indicator - whether user is online/offline (Additional feature).

## API Endpoints

- Required endpoints can be found in the server code.

## Purpose

- This project is for Lateral Inductions of Spider R&D.

## Tech Stack Used

1. MongoDB Atlas
2. ExpressJS
3. ReactJS
4. NodeJS
5. TailwindCSS
6. Docker Desktop
7. Nginx
8. APIs used :
   - Google Drive API (For file storage)
   - Google Auth 2.0 (For Google Sign In)
9. Libraries used:
   - Socket.io
   - bcryptjs (For hashing)
   - crypto.js (For encryption)
   - jsonwebtoken (For JWT based Authentication)

## Known issues
   - Sometimes, there is a bit of lag when rendering the chats.
   - Video call request is not being sent properly over web-sockets and webRTC is causing some issues.