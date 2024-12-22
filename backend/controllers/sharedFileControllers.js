const Share = require("../models/sharedFileModel");

const shareFile = async (req, res) => {
  const { fileName, link, userId, owner } = req.body;

  try {
    const data = await Share.findOne({ owner: owner, fileName: fileName, link: link });
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
    const data = await Share.find({ sharedWith: { $in: [userId] } }).populate("owner", "email");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send("Error : Could not fetch shared files");
  }
};

const deleteSharedFile = async (req, res) => {
    const { sharedFileId, userId } = req.body;
    try {
      await Share.updateOne({_id: sharedFileId}, {$pull : {sharedWith: userId}});
      // add feature - delete shared file from database if sharedWith array is empty after deletion
      res.status(200).send("Successfully deleted shared file");
    } catch (err) {
      res.status(500).send("Error : Could not delete shared files");
    }
  };

module.exports = { shareFile, fetchedSharedFiles, deleteSharedFile };
