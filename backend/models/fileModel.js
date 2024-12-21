const mongoose = require("mongoose");

const fileModel = new mongoose.Schema(
    {
        fileName: {type: String, required: true}, // add unique feature later
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        link: {type: String, required: true}
    },
    {timestamps : true}
);

module.exports = mongoose.model("Files", fileModel);