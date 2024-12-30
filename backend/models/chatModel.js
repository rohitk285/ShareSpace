const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    toggleState: {type: Boolean, default: false},
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        added: { type: String, default: "" }
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatModel);
