# ShareSpace - Spider Lateral Inductions - Application Development

## Overview

ShareSpace is a full-stack multi-purpose web application featuring real-time peer-to-peer and group messaging, real-
time collaborative document editing, and file storage, management, and sharing. Leveraged web 
sockets to implement seamless real-time communication and collaborative functionality, enabling 
efficient user interaction. Implemented a secure authentication system using JWT and integrated 
Google OAuth. 

## Table of Contents

- [Setup](#setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Purpose](#purpose)
- [Tech Stack](#tech-stack)

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Compass or Atlas)
- Google Cloud Console account - Google Drive API (for file uploads)

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

3. **Client Setup**

   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the `server` folder and add the following variables:

   ```env
   PORT=<your-port-number>
   MONGODB_URI = <your_mongodb_uri>
   JWT_SECRET=<your-jwt-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   SESSION_SECRET=<your-session-secret>
   SERVICE_ACCOUNT_FILE=<path-to-your-service-account-file>
   ```

5. **Run the Application**
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

## Usage

1. Navigate to `http://localhost:3000` to access the application.
2. Users can chat with their peers or create a group chat. (socket.io)
3. Users can see whether other users are offline or online
4. Admins can decide whether newer members can see chat history.
5. User can create a collaborative and simultaneously edit the document in real-time (socket.io)
6. Users can share files with their peers.
7. Normal SSO Authentication and Google Auth2.0 has been implemented

## API Endpoints

- Required endpoints can be found in the server code.

## Purpose

This project is for Lateral Inductions of Spider R&D.

## Tech Stack

1. MongoDB Atlas
2. ExpressJS
3. ReactJS
4. NodeJS
5. TailwindCSS
6. Google Drive API
7. Socket.io
8. JWT and Google Auth 2.0 (Authentication)