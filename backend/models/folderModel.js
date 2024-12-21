const mongoose = require("mongoose");

const folderModel = new mongoose.Schema(
    {
        folderName: {type: String, required: true}, //add unique feature later
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        accessTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        files: [
            {
                link: { type: String, required: true },
                fileName: { type: String, required: true },
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Folder", folderModel);
