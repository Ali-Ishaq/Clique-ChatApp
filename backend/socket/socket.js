const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const User = require("../Models/userModel");

const app = express();
const httpServer = createServer(app);

const userSocketMap = {}; //{userId:socketId}

const getUserSocketId = (userId) => {
  return userSocketMap[userId];
};

const io = new Server(httpServer, {
  cors: {
    origin: ["http://192.168.0.128:5173", "http://192.168.0.128:5173","https://clique-chat-app.vercel.app"],
  },
});

io.on("connection", (socket) => {
  console.log("User Connected with ID : ", socket.id);

  const userId = socket.handshake.query.userId;
  userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("searchUsers", async (string) => {
    
    const users = await User.find({ username: { $regex: `^${string}` } })
      .select("_id username")
      .limit(10);

    // Remove the user who have searched
    const searchResults = users.filter((user) => {
      return user._id != userId;
    });

    
    socket.emit("getUserSearchResult", searchResults);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected with ID : ", socket.id);
    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { app, httpServer, io, getUserSocketId };
