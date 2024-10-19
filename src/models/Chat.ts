const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Array of user IDs
  ],
  messages: [messageSchema], // Array of message objects
  lastMessage: {
    text: { type: String, required: true }, // Last message content
    timestamp: { type: Date, default: Date.now }, // Time of the last message
  },
});

// Creating the Chat model from the schema
const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
