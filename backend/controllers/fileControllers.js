const multer = require("multer");
const streamifier = require("streamifier");
const { google } = require("googleapis");
const File = require("../models/fileModel"); // Import the File model
const Share = require("../models/sharedFileModel");

// Google Drive API setup
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const SERVICE_ACCOUNT_FILE = process.env.SERVICE_ACCOUNT_FILE; // Path to service account key file
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});
const driveService = google.drive({ version: "v3", auth });

// Set up multer to store files in memory (no local file storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFile = async (req, res) => {
  const { fileName, user } = req.body; // Get fileName and user from body
  const file = req.file; // Get file from multer's req.file

  try {
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    if (!fileName || !user) {
      return res.status(400).json({ message: "File name and user ID are required" });
    }

    // Create a readable stream from the file buffer
    const stream = streamifier.createReadStream(file.buffer);

    // Upload the file to Google Drive
    const driveResponse = await driveService.files.create({
      requestBody: {
        name: fileName, // Name of the file in Google Drive
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Optional: specify a folder in Google Drive
      },
      media: {
        mimeType: file.mimetype,
        body: stream,
      },
      fields: "id, webViewLink", // Get file ID and shareable link
    });

    // Set permissions to make the file accessible
    await driveService.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const fileLink = driveResponse.data.webViewLink;

    // Save the file metadata to MongoDB
    const newFile = new File({
      fileName: fileName,
      owner: user,
      link: fileLink, // Use the shareable link from Google Drive
    });

    await newFile.save();

    res.status(200).json({ message: "File uploaded and saved successfully", file: newFile });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ message: "File upload failed", error });
  }
};

const fetchUploadedFiles = async (req, res) => {
  const { userId } = req.body;

  try {
    const response = await File.find({ owner: userId });
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "File fetching failed", err });
  }
};

const deleteFile = async (req, res) => {
  const { fileId } = req.body;

  try {
    // Delete the file from Google Drive
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found in database" });
    }
    
    const response = await Share.findOne({originalFileId: fileId});
    // console.log(response);

    if(!response)
      await driveService.files.delete({ fileId: file.link.split("/d/")[1].split("/")[0] });

    // Delete the file metadata from MongoDB
    await File.deleteOne({ _id: fileId });

    res.status(200).send("File deleted successfully");
  } catch (err) {
    console.error("Error during file deletion:", err);
    res.status(500).json({ message: "File deletion failed", err });
  }
};

module.exports = { uploadFile, fetchUploadedFiles, deleteFile };
