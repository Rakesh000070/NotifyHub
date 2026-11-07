
/*
========================================================
AUTH CONTROLLER
========================================================
This file handles:
1. User registration
2. User login
3. Password hashing and comparison
4. JWT token generation
*/

// Import the User model to interact with MongoDB.
const User = require("../models/User");

// Import bcrypt to hash passwords and compare login passwords.
const bcrypt = require("bcryptjs");

// Import JWT to generate authentication tokens.
const jwt = require("jsonwebtoken");


// ======================================================
// HELPER FUNCTION: GENERATE JWT TOKEN
// ======================================================

/*
Creates a JWT token containing the user's ID.

The token expires after 7 days.
The JWT_SECRET must be configured in the server's .env file.
*/
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: userId.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// ======================================================
// REGISTER USER
// ======================================================

/*
POST /api/auth/register

Expected request body:
{
  "name": "Rakesh Nayak",
  "email": "rakesh@example.com",
  "password": "yourpassword"
}
*/
const registerUser = async (req, res) => {
  try {
    // Read the registration information from the request.
    const { name, email, password } = req.body || {};

    // Validate the supplied fields before accessing the database.
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name and email are required. Password must be at least 8 characters.",
      });
    }

    // Normalize the email so capitalization and surrounding
    // whitespace do not create inconsistent account lookups.
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether an account with this email already exists.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User already exists. Please log in or use another email.",
      });
    }

    // Hash the password before saving it to MongoDB.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with the hashed password.
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate a JWT token for the newly registered user.
    const token = generateToken(newUser._id);

    // Return the user details without exposing the password hash.
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    // Log technical details on the server for debugging.
    console.error("Register user error:", error);

    // Handle duplicate email errors from MongoDB, including
    // registrations submitted simultaneously.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Avoid exposing internal server details to the client.
    return res.status(500).json({
      success: false,
      message: "Unable to register user.",
    });
  }
};


// ======================================================
// LOGIN USER
// ======================================================

/*
POST /api/auth/login

Expected request body:
{
  "email": "rakesh@example.com",
  "password": "yourpassword"
}
*/
const loginUser = async (req, res) => {
  try {
    // Read the login credentials from the request.
    const { email, password } = req.body || {};

    // Validate the credentials before querying the database.
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Use the same email normalization as registration.
    const normalizedEmail = email.trim().toLowerCase();

    // Find the user account in MongoDB.
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Use the same error for an unknown account and an incorrect
    // password to avoid revealing whether an account exists.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare the submitted password with the stored password hash.
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // Reject the login if the passwords do not match.
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate a JWT token for the authenticated user.
    const token = generateToken(user._id);

    // Return the token and safe user details, not the password.
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Log the detailed error on the server.
    console.error("Login user error:", error);

    // Return a generic message to the client.
    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

// These names must match the imports in authRoutes.js.
module.exports = {
  registerUser,
  loginUser,
};
