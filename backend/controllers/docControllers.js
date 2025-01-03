const { access } = require("fs");
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
    const response = await Docs.find({
      collaborators: { $elemMatch: { user: _id } },
    })
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
    const response = await Docs.findOne({ _id: docId }).populate(
      "collaborators.user",
      "email"
    );
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
    await Docs.updateOne(
      { _id: docId },
      { $pull: { collaborators: collaboratorId } }
    );
    res.status(200).send("Successfully deleted");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCollaborator = async (req, res) => {
  const { docId, userId, access } = req.body;
  try {
    // Fetch documents for the given user _id
    await Docs.updateOne(
      { _id: docId },
      { $push: { collaborators: { user: userId, access: access } } }
    );
    res.status(200).send("Successfully added");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCollaboratorAccess = async (req, res) => {
  const { docId, collaboratorId, access } = req.body;
  try {
    await Docs.updateOne(
      { _id: docId, "collaborators.user": collaboratorId },
      { $set: { "collaborators.$.access": access } }
    );
    res.status(200).send("Successfully changed access");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  fetchDocuments,
  fetchDocumentsCollab,
  deleteDocument,
  getDocDetails,
  createDocument,
  removeCollaborator,
  addCollaborator,
  updateCollaboratorAccess,
};
