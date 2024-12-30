const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  console.log(name, email);
  try {
    console.log("Registering user with email:", email); // Log for debugging
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword); // Log the hashed password for debugging

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "User not created" });
    }
  } catch (error) {
    console.error("Error during registration:", error); // Log error for debugging
    res.status(500).json({ message: error.message || "Server error" });
  }
};

//description     auth the user
//route           POST /api/users/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id); // Generate the token

      res.json({
        googleId: user.googleId,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: token, // Include the token in the response
      });
    } else {
      res.status(401).json({ message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.error("Error during authentication:", error); // Log errors for debugging
    res.status(500).json({ message: error.message });
  }
};

const getGoogleUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json({
      googleId: user.googleId,
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: token
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).send("Unauthorized");
  }
};

module.exports = { allUsers, registerUser, authUser, getGoogleUser };
