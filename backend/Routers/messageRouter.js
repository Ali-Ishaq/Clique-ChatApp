const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConverstions,
  getConversationMessages,
  createConversation,
  getSingleConversation,
  createGroupConversation
} = require("../Controllers/messageController");

router
  .post("/sendMessage", sendMessage)
  .get("/get-conversations", getConverstions)
  .post("/get-conversation-messages", getConversationMessages)
  .post("/create-conversation", createConversation)
  .post("/get-conversation", getSingleConversation)
  .post("/create-group-conversation",createGroupConversation);

module.exports = router;
