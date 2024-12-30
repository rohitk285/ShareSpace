const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    // check if private chat already exists
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = async (req, res) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(populatedResults);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  let users = JSON.parse(req.body.users);

  // creating the members array with the current time in 'added'
  let members = users.map(user => ({
    user: user, 
    added: new Date().toISOString(),  // add the current time of creating group and adding members
  }));

  members.push({user: req.body.userId, added: new Date().toISOString()});

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      members: members,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@description     Rename Group
//@route           PUT /api/chat/rename
//@access          Protected
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat Not Found" });
    }
    res.json(updatedChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@description     Remove user from Group
//@route           PUT /api/chat/groupremove
//@access          Protected
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: {
          users: userId,
          members: { user: userId }, // remove from members array where user matches
        },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(404).json({ message: "Chat Not Found" });
    }
    res.json(removed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@description     Add user to Group / Leave
//@route           PUT /api/chat/groupadd
//@access          Protected
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    // Add the user to the users array and the members array with the current timestamp
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          users: userId,
          members: {
            user: userId, 
            added: new Date().toISOString(), // adding the current timestamp
          },
        },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(404).json({ message: "Chat Not Found" });
    }

    res.json(added);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changeToggle = async (req, res) => {
  const {chatId, toggleState} = req.body;

  try{
    await Chat.updateOne({_id: chatId}, {$set : {toggleState: toggleState}});
    res.status(200).send("Successfully updated toggle state");
  }
  catch(err){
    res.status(500).send({message: err.message});
  }
}

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  changeToggle
};
