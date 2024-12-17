const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Deployment setup
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Map to store userId -> socketId mappings
const userSockets = {};

io.on("connection", (socket) => {
  console.log("Connected to Socket.IO");

  socket.on("setup", (userData) => {
    userSockets[userData._id] = socket.id;
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
  
    if (!chat || !chat._id) {
      console.log("Chat ID not defined");
      return;
    }
  
    console.log(`Message sent to room: ${chat._id}`);
  
    // Emit the message to all users in the room except the sender
    socket.broadcast.to(chat._id).emit("message received", newMessageReceived);
  });

  socket.on("video call request", ({ senderId, recipientId, roomId }) => {
    console.log(`Video call request from ${senderId} to ${recipientId}`);

    const recipientSocketId = userSockets[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("incoming video call", {
        senderId,
        roomId,
      });
    } else {
      console.log(`Recipient ${recipientId} is not connected`);
    }
  });

  socket.on("send signal", (data) => {
    const { userToSignal, signal, callerId } = data;
    io.to(userToSignal).emit("receive signal", { signal, callerId });
  });

  socket.on("return signal", (data) => {
    const { signal, callerId } = data;
    io.to(callerId).emit("receive returned signal", { signal, id: socket.id });
  });

  socket.on("leave video room", ({ roomId, userId }) => {
    socket.leave(roomId);
    console.log(`User ${userId} left video room: ${roomId}`);
    socket.to(roomId).emit("user left", userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    for (let userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});
