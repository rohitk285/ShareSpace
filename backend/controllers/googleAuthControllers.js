const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Assuming you have a User model to interact with the database

// Controller for handling Google OAuth callback
exports.googleAuthCallback = async (req, res) => {
  try {
    const { googleId, email, name, photos } = req.user; // Extract Google profile data

    // Check if the user exists in the database by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // If the user does not exist, create a new one
      user = await User.create({
        googleId,
        email,
        name,
        pic: photos ? photos[0].value : undefined, // Use Google profile picture (optional)
      });
    }

    // Generate JWT token for the authenticated user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d", // Adjust the expiry time as needed
    });

    // Redirect to frontend with the JWT token (or send as response if API)
    res.redirect(`http://localhost:5173?token=${token}`); // This redirects to your frontend and includes the token
  } catch (error) {
    console.error("Error in Google Auth Callback:", error);
    res.status(500).send("Internal Server Error");
  }
};
