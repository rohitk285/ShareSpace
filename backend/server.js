const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("./config/passport");
const session = require("express-session");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const docRoutes = require("./routes/docRoutes");
const fileRoutes = require("./routes/fileRoutes");
const Docs = require("./models/docModel");
const User = require("./models/userModel");
const io = require("socket.io");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Change to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Ensure the cookie is secure in production
  })
);

app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Use Passport sessions for user authentication
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/auth/google", googleAuthRoutes);
app.use("/api/document", docRoutes);
app.use("/api/file", fileRoutes);

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

// Socket.io setup
const socketIo = io(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Map to store userId -> socketId mappings
const userSockets = {};

socketIo.on("connection", (socket) => {
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

  // Text Editor-specific socket events
  socket.on("get-document", async (documentId, user) => {
    if (!user || !user._id) {
      console.error("User is not authenticated or missing.");
      return; // Handle error or disconnect
    }

    const document = await findDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document); // Emit the document data when loaded

    socket.on("send-changes", (delta) => {
      // Emit the changes to all clients in the room except the sender
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async data => {
      try {
        // Save the document to the database
        await Docs.findByIdAndUpdate(documentId, { data });
      } catch (err) {
        console.error("Error while saving document", err);
      }
    });

    socket.on("version-control", async data => {
      const d = new Date();
      const time =
        `${String(d.getDate()).padStart(2, "0")}-` +
        `${String(d.getMonth() + 1).padStart(2, "0")}` +
        `-${d.getFullYear()}, ` +
        `${String(d.getHours()).padStart(2, "0")}` +
        `:${String(d.getMinutes()).padStart(2, "0")}`;

      // Store the version with the timestamp
      await Docs.updateOne(
        { _id: documentId },
        { $push: { version: { storedData: data, time: time } } }
      );
    });
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

async function findDocument(id) {
  if (id === null) return;

  let document = await Docs.findById(id);
  return document;
}
