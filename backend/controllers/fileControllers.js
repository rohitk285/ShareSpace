const cloudinary = require("../config/cloudinary"); // Cloudinary configuration
const multer = require("multer");
const streamifier = require("streamifier");
const File = require("../models/fileModel"); // Import the File model

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

    // Determine the MIME type (you can use file.mimetype for this)
    const mimeType = file.mimetype;

    // Create a readable stream from the file buffer
    const stream = streamifier.createReadStream(file.buffer);

    // Cloudinary upload as a promise using raw/upload for non-image files
    const cloudinaryUpload = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw", // For non-image files
          // Specify content type dynamically
          content_type: file.mimetype, // Set correct content type
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.pipe(uploadStream);
    });

    // Await the upload result from Cloudinary
    const result = await cloudinaryUpload;

    // Save the file metadata to MongoDB
    const newFile = new File({
      fileName: fileName,
      owner: user,
      link: result.secure_url, // Use the secure URL from Cloudinary
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
    await File.deleteOne({ _id: fileId });
    res.status(200).send("File deleted successfully")
  } catch (err) {
    res.status(500).json({ message: "File deleting failed", err });
  }
};

module.exports = { uploadFile, fetchUploadedFiles, deleteFile };