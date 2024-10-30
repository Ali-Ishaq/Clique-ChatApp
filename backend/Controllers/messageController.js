const Message = require("../Models/messageModel");
const Conversation = require("../Models/conversationModel");
const User = require("../Models/userModel");

const jwt = require("jsonwebtoken");
const { io, getUserSocketId } = require("../socket/socket");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, conversationId } = req.body;
    
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }
    

    const { username } = jwt.verify(token, process.env.JWT_SECRET);

    const { _id: senderId } = await User.findOne({ username });

    if (!senderId) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }

    const newMessage = new Message({ senderId, receiverId, message });
    newMessage.save();

    const existingConversation = await Conversation.findById(conversationId);

    // { $inc: { [`unreadMessages.${receiverId[0]}`]: 1 } }, // Increment the specific key
    // { new: true } // Optionally return the updated document

    if (existingConversation) {
      existingConversation.messages.push(newMessage._id);

      const newObj = Object.entries(existingConversation.unreadMessages).map(
        ([key, value]) => {
          if (key != senderId.toString()) {
            value += 1;
          }else if(key == senderId.toString()){
            value = 0
          }
          return [key, value];
        }
      );
      const resultedObj = Object.fromEntries(newObj);

      existingConversation.unreadMessages = resultedObj;

      await existingConversation.save();
    } else {
      const newConversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [newMessage._id],
        unreadMessages: {
          [senderId]: 0,
          [receiverId]: 1,
        },
      });
      await newConversation.save();
    }

    res.status(200).json({
      status: "success",
      message: "Message Successfully Sent !",
      data: newMessage,
    });

    // Realtime Message Implementation'
    const responseMessage= await Message.findById(newMessage._id).populate('senderId')
    
    receiverId.map((elem)=>{ 
      const socketId = getUserSocketId(elem);
  
      if (socketId) {
        io.to(socketId).emit("getMessage", {...responseMessage._doc,conversationId:conversationId});
      }
    })


  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getConverstions = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }

    const { username } = jwt.verify(token, process.env.JWT_SECRET);
    const { _id: userId } = await User.findOne({ username });

    const conversations = await Conversation.aggregate([
      { $match: { participants: userId } },
      {
        $project: {
          participants: 1,
          unreadMessages: 1,
          createdAt: 1,
          groupName: 1,
          lastMessage: { $arrayElemAt: ["$messages", -1] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
      {
        $lookup: {
          from: "messages", // Assuming your messages collection is named 'messages'
          localField: "lastMessage",
          foreignField: "_id",
          as: "lastMessage",
        },
      },
    ]);

    const modifiedConversations = conversations.map((element, index) => {
      element.participants = element.participants.filter(
        (participant) => participant._id.toString() != userId
      );
      return element;
    });

    res.status(200).json({
      status: "success",
      message: "Success",
      data: modifiedConversations,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }

    const { username } = jwt.verify(token, process.env.JWT_SECRET);
    const { _id: userId } = await User.findOne({ username }).select(
      "-password"
    );

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { [`unreadMessages.${userId}`]: 0 },
      { new: true }
    )
      .select("messages")
      .populate({
        path: "messages",
        populate: {
          path: "senderId", // Populate sender and receiver in messages
        },
      });

    const messages = conversation.messages.map((message) => {
      const isSent = message._doc.senderId._id.toString() == userId.toString();
      return { ...message._doc, isSent: isSent };
    });

    res.status(200).json({
      status: "success",
      message: "Success",
      data: messages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const createConversation = async (req, res) => {
  try {
    const { id } = req.body;
    const token = req.cookies.token;
    

    if (!token) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }

    const { username } = jwt.verify(token, process.env.JWT_SECRET);
    const user1 = await User.findOne({ username }).select("_id");
    const user2 = await User.findOne({ _id: id }).select("_id");
    
    if (!(user1 && user2)) {
      return res.status(401).json({
        status: "notfound",
        message: "One of the User doesn't exist",
      });
    }

    const newConversation = new Conversation({
      participants: [user1, user2],
      unreadMessages: {
        [user1._id.toString()]: 0,
        [user2._id.toString()]: 0,
      },
    });

    await newConversation.save();

    const conversation = await Conversation.findOne({
      participants: [user1, user2],
    })
      .populate("participants")
      .select("-password");

    conversation.participants = conversation.participants.filter(
      (participant) => participant._id.toString() != user1._id.toString()
    );

    res.status(200).json({
      status: "success",
      message: "success",
      data: conversation,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getSingleConversation = async (req, res) => {
  try {
    const {conversationId} = req.body;
    

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }

    const {username}=jwt.verify(token, process.env.JWT_SECRET)

    const user=await User.findOne({username:username}).select('_id')
    

    const conversation = await Conversation.findById(
      conversationId
    )
      .populate({ path: "participants", select: "-password" })
      .populate("messages");

    if (!conversation) {
      throw new Error("Converstion don't exist");
    }

    conversation.participants = conversation.participants.filter(
      (participant) => participant._id.toString() != user._id.toString()
    );

    console.log(conversation)

    res.status(200).json({
      status: "success",
      message: "success",
      data: conversation,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const createGroupConversation = async (req, res) => {
  try {
    const { participants, groupName } = req.body;
    const token = req.cookies.token;

    if (!token || participants.length < 2) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User or Insufficient Participants",
      });
    }

    const { username } = jwt.verify(token, process.env.JWT_SECRET);
    const { _id: user } = await User.findOne({ username: username }).select(
      "_id"
    );

    if (!user) {
      return res.status(401).json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }

    participants.unshift(user);
    const unreadMessagesCount = {};

    participants.forEach((element) => {
      unreadMessagesCount[element] = 0;
    });

    const groupConversation = new Conversation({
      participants: participants,
      unreadMessages: unreadMessagesCount,
      groupName: groupName,
    });

    groupConversation.save();

    res.json({
      status: "success",
      message: "Success",
      data: groupConversation,
    });
  } catch (error) {}
};

module.exports = {
  sendMessage,
  getConverstions,
  getConversationMessages,
  createConversation,
  getSingleConversation,
  createGroupConversation,
};
