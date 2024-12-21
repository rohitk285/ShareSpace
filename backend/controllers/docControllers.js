const Docs = require("../models/docModel");

const fetchDocuments = async (req, res) => {
  const { _id } = req.body;
  try {
    // Fetch documents for the given user _id
    const response = await Docs.find({ creator: _id }).sort({ createdAt: -1 });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchDocumentsCollab = async (req, res) => {
  const { _id } = req.body;
  try {
    // Fetch documents for the given user _id
    const response = await Docs.find({ collaborators: { $in: [_id] } })
      .populate("creator", "email")
      .sort({ createdAt: -1 });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  const { docId } = req.body;
  try {
    // Fetch documents for the given user _id
    await Docs.deleteOne({ _id: docId });
    res.status(200).send("Successfully deleted");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDocDetails = async (req, res) => {
  const { docId } = req.body;
  try {
    console.log(docId);
    const response = await Docs.findOne({ _id: docId }).populate("collaborators", "email");
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send("Could not fetch document details");
  }
};

const createDocument = async (req, res) => {
  const documentData = req.body;
  try {
    const newDocument = new Docs(documentData);
    // Save the new document to the database
    await newDocument.save();
    res.status(200).send("Successfully created document");
  } catch (err) {
    res.status(500).send("Could not fetch document details");
  }
};

const removeCollaborator = async (req, res) => {
  const { docId, collaboratorId } = req.body;
  try {
    // Fetch documents for the given user _id
    await Docs.updateOne({ _id: docId }, {$pull : {collaborators : collaboratorId}});
    res.status(200).send("Successfully deleted");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCollaborator = async (req, res) => {
  const { docId, userId } = req.body;
  try {
    // Fetch documents for the given user _id
    await Docs.updateOne({ _id: docId }, {$push : {collaborators : userId}});
    res.status(200).send("Successfully added");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchDocuments,
  fetchDocumentsCollab,
  deleteDocument,
  getDocDetails,
  createDocument,
  removeCollaborator,
  addCollaborator
};
