const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//description     Get or Search all users
//route           GET /api/user?search=
const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//description     Register new user
//route           POST /api/user/
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name,email);
    try {
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Please enter all the fields" });
      }
  
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      const user = await User.create({
        name: name,
        email: email,
        password: password,
        // pic: pic,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        //   pic: user.pic,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error("User not found");
      }

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };  

//description     auth the user
//route           POST /api/users/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid Email or Password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { allUsers, registerUser, authUser };
