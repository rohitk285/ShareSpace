const express = require("express");
const {
  fetchDocuments,
  deleteDocument,
  getDocDetails,
  createDocument,
  fetchDocumentsCollab,
  removeCollaborator,
  addCollaborator,
  updateCollaboratorAccess,
} = require("../controllers/docControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/fetchDocuments").post(protect, fetchDocuments);
router.route("/fetchDocumentsCollab").post(protect, fetchDocumentsCollab);
router.route("/deleteDocument").post(protect, deleteDocument);
router.route("/getDocDetails").post(protect, getDocDetails);
router.route("/createDocument").post(protect, createDocument);
router.route("/removeCollaborator").post(protect, removeCollaborator);
router.route("/addCollaborator").post(protect, addCollaborator);
router.route("/updateCollaboratorAccess").post(protect, updateCollaboratorAccess);

module.exports = router;
