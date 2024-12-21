const mongoose = require("mongoose");

const sharedFileModel = new mongoose.Schema(
  {
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // User who owns the file
    file: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "File", 
      required: true 
    }, // Reference to the file being shared
    sharedWith: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ], // Users the file is shared with
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedFile", sharedFileModel);
