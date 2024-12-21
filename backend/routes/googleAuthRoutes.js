const express = require("express");
const passport = require("passport");
const { googleAuthCallback } = require("../controllers/googleAuthControllers");

const router = express.Router();

// Google OAuth Routes
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/" }), // Ensure this matches your URL in Google API console
  googleAuthCallback
);

module.exports = router;
