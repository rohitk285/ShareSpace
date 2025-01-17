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
const sharedFileRoutes = require("./routes/sharedFileRoutes");
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
app.use("/api/share-file", sharedFileRoutes);

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

// maps to store user-related data (whether they are online or offline)
const userSockets = {}; // userId -> socketId
const userStatus = {}; // userId -> { socketId: string, isOnline: boolean }
const onlineUsers = {}; // userId -> { username, status }

socketIo.on("connection", (socket) => {
  console.log("Connected to Socket.IO");

  // When a user sets up their socket
  socket.on("setup", (userData) => {
    userSockets[userData._id] = socket.id;
    userStatus[userData._id] = { socketId: socket.id, isOnline: true };
    onlineUsers[userData._id] = { userId: userData._id, status: "online" };
    socket.join(userData._id);
    console.log(userData);
    socket.emit("connected");

    // Notify all other users about the user's online status
    socketIo.emit("user-status-change", {
      userId: userData._id,
      isOnline: true,
    });

    // Send the current online users list to the newly logged-in user
    socket.emit("online-users", Object.values(onlineUsers)); // Send full list of online users
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
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
      console.log(delta);
      // Emit the changes to all clients in the room except the sender
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      try {
        // Save the document to the database
        await Docs.updateOne({_id: documentId}, {$set: {data: data}});
      } catch (err) {
        console.error("Error while saving document", err);
      }
    });

    socket.on("version-control", async (data) => {
      // remove version control
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

  // // Handle video call offer
  // socket.on("video-call-offer", (offer, recipientId) => {
  //   socket.to(recipientId).emit("video-call-offer", offer);
  // });

  // // Handle video call answer
  // socket.on("video-call-answer", (answer, recipientId) => {
  //   socket.to(recipientId).emit("video-call-answer", answer);
  // });

  // // Handle ICE candidate exchange
  // socket.on("ice-candidate", (candidate, recipientId) => {
  //   socket.to(recipientId).emit("ice-candidate", candidate);
  // });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    for (let userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        // Notify peers about the user's offline status
        const peers = Object.keys(userStatus).filter((id) => id !== userId);
        peers.forEach((peerId) => {
          socketIo.to(peerId).emit("user-status-change", {
            userId,
            isOnline: false,
          });
        });

        delete userSockets[userId];
        delete userStatus[userId];
        delete onlineUsers[userId];
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
