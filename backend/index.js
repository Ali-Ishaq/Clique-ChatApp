require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { httpServer, app } = require("./socket/socket");

const userRouter = require("./Routers/UserRouter");
const messageRouter = require("./Routers/messageRouter");
const Conversation = require("./Models/conversationModel");
const Message = require("./Models/messageModel");


const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.128:5173",
  "https://clique-chat-app.vercel.app"

];

app.use(cookieParser());

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {

      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/user", userRouter);
app.use("/messages", messageRouter);

app.get("/", (req, res) => {
  res.send("Server Listening at PORT : 3000");
});


mongoose
  .connect(process.env.DB_URI)
  .then(() => {
     
    httpServer.listen(process.env.PORT || 3000, () => {
      console.log("Server Listening at PORT : ", process.env.PORT || 3000);
    });
  })
  .catch((er) => {
    console.log("error Connecting to db : ", er.message);
  });


 
