const mongoose = require("mongoose");

// collaborator schema
const collaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  access: { type: String, enum: ["view", "edit"], required: true },
});

const docModel = new mongoose.Schema(
  {
    _id: String,
    data: Object,
    documentName: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [collaboratorSchema],
    documentType: { type: String, enum: ["public", "private"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Docs", docModel);
