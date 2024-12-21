const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel"); // Assuming the User model is located in the `models` directory
require('dotenv').config();

console.log(process.env.GOOGLE_CLIENT_ID);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Ensure this is being loaded correctly
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Ensure this is being loaded correctly
      callbackURL: "http://localhost:3000/auth/google/callback", // Adjust according to your application setup
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database using the googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            pic: profile.photos ? profile.photos[0].value : undefined, // Optional: Use Google profile photo
          });
        }

        return done(null, user); // Return the user object
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize and deserialize the user for session handling
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Updated deserializeUser method using async/await
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Find the user by ID using async/await
    done(null, user); // If user is found, pass the user object to done
  } catch (err) {
    done(err, null); // If error occurs, pass error to done
  }
});

module.exports = passport;