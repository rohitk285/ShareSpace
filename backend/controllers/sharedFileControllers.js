const Share = require('../models/sharedFileModel');

const shareFile = async (req, res) => {
    const {fileId, userId, owner} = req.body;
    try{
        const data = await Share.findOne({file: fileId});
        console.log(data);
        if(data){
            if(!data.sharedWith.includes(userId))
                await Share.updateOne({file: fileId}, {$push : {sharedWith: [userId]}});
        }
        else{
            await Share.create({owner:owner, file: fileId, sharedWith: [userId]});
        }
        res.status(200).send("Successfully shared");
    }
    catch(err){
        res.status(500).send("Error: Could not share file");
    }
}

module.exports = {shareFile};