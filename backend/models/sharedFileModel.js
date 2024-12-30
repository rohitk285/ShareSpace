const mongoose = require("mongoose");

const sharedFileModel = new mongoose.Schema(
  {
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // User who owns the file
    originalFileId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Files", 
      required: true 
    }, // reference to the fileId being shared
    fileName: { 
      type: String, 
      required: true 
    }, // reference to the file name being shared
    link: { 
      type: String,
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
