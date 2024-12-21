const express = require("express");
const { shareFile } = require("../controllers/sharedFileControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/shareFile").post(protect, shareFile);

module.exports = router;