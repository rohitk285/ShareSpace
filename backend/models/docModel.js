const mongoose = require("mongoose");

const docModel = new mongoose.Schema(
  {
    _id: String,
    data: Object,
    documentName: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    documentType: { type: String, enum: ["public", "private"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Docs", docModel);
