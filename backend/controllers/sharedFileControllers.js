const Share = require("../models/sharedFileModel");
const File = require("../models/fileModel"); // Import the File model
const { google } = require("googleapis");

// Google Drive API setup
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const SERVICE_ACCOUNT_FILE = process.env.SERVICE_ACCOUNT_FILE; // Path to service account key file
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});
const driveService = google.drive({ version: "v3", auth });

const shareFile = async (req, res) => {
  const { originalFileId, fileName, link, userId, owner } = req.body;

  try {
    const data = await Share.findOne({
      owner: owner,
      fileName: fileName,
      link: link,
    });
    // console.log(data);
    if (data) {
      if (!data.sharedWith.includes(userId))
        await Share.updateOne(
          { owner: owner, fileName: fileName, link: link },
          { $push: { sharedWith: [userId] } }
        );
    } else {
      await Share.create({
        owner: owner,
        originalFileId: originalFileId,
        fileName: fileName,
        link: link,
        sharedWith: [userId],
      });
    }
    res.status(200).send("Successfully shared");
  } catch (err) {
    res.status(500).send("Error: Could not share file");
  }
};

const fetchedSharedFiles = async (req, res) => {
  const { userId } = req.body;
  try {
    const data = await Share.find({ sharedWith: { $in: [userId] } }).populate(
      "owner",
      "email"
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send("Error : Could not fetch shared files");
  }
};

const deleteSharedFile = async (req, res) => {
  const { sharedFileId, originalFileId, userId } = req.body;

  try {
    await Share.updateOne(
      { _id: sharedFileId },
      { $pull: { sharedWith: userId } }
    );
    const sharedFile = await Share.findOne({ _id: sharedFileId });

    if (sharedFile.sharedWith.length === 0) {
      await Share.deleteOne({ _id: sharedFileId });

      const response = await File.findOne({_id: originalFileId});
      if(!response){
        // ensuring sharedFile contains the file link
        const fileId = sharedFile.link.split("/d/")[1].split("/")[0];
        await driveService.files.delete({ fileId }); // Delete from Google Drive using the fileId
      }
    }

    res.status(200).send("Successfully deleted shared file");
  } catch (err) {
    console.error("Error deleting shared file:", err);
    res.status(500).send("Error: Could not delete shared files");
  }
};

module.exports = { shareFile, fetchedSharedFiles, deleteSharedFile };
