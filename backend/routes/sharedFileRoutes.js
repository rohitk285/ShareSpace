const express = require("express");
const { shareFile, fetchedSharedFiles, deleteSharedFile } = require("../controllers/sharedFileControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/shareFile").post(protect, shareFile);
router.route("/fetchSharedFiles").post(protect, fetchedSharedFiles);
router.route("/deleteSharedFile").post(protect, deleteSharedFile);

module.exports = router;