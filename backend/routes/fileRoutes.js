const express = require('express');
const multer = require('multer');
const { uploadFile, fetchFiles } = require('../controllers/fileControllers');
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Set up multer to handle file upload in memory (no local storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for file upload
router.post('/upload', protect, upload.single('file'), uploadFile);
router.route("/fetchFiles").post(protect, fetchFiles);

// Export the router
module.exports = router;
