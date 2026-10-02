// Import the User model.
// We use this model to interact with the users collection in MongoDB.
const User = require("../models/User");

// bcrypt is used to securely hash passwords
// and compare passwords during login.
const bcrypt = require("bcryptjs");

// jsonwebtoken is used to create JWT authentication tokens.
const jwt = require("jsonwebtoken");


// ======================================================
// REGISTER USER
// ======================================================

// Controller function to handle user registration.
const registerUser = async (req, res) => {
  try {
    // Get user information from the request body.
    const { name, email, password } = req.body;


    // --------------------------------------------------
    // 1. Check if user already exists
    // --------------------------------------------------

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists. Try to login or use another email.",
      });
    }


    // --------------------------------------------------
    // 2. Hash the password
    // --------------------------------------------------

    // Convert the plain-text password into a secure hash.
    const hashedPassword = await bcrypt.hash(password, 10);


    // --------------------------------------------------
    // 3. Create the user
    // --------------------------------------------------

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });


    // --------------------------------------------------
    // 4. Generate JWT token
    // --------------------------------------------------

    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    // --------------------------------------------------
    // 5. Hide password from response
    // --------------------------------------------------

    newUser.password = undefined;


    // --------------------------------------------------
    // 6. Send successful response
    // --------------------------------------------------

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user: newUser,
    });

  } catch (error) {

    // Handle unexpected errors.
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ======================================================
// LOGIN USER
// ======================================================

// Controller function to handle user login.
const loginUser = async (req, res) => {
  try {

    // Get email and password from request body.
    const { email, password } = req.body;


    // --------------------------------------------------
    // 1. Find user by email
    // --------------------------------------------------

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // --------------------------------------------------
    // 2. Compare password
    // --------------------------------------------------

    // Compare the password entered by the user
    // with the hashed password stored in MongoDB.
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );


    // If password is incorrect.
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    // --------------------------------------------------
    // 3. Generate JWT token
    // --------------------------------------------------

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    // --------------------------------------------------
    // 4. Hide password
    // --------------------------------------------------

    user.password = undefined;


    // --------------------------------------------------
    // 5. Send successful login response
    // --------------------------------------------------

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    // Handle unexpected errors.
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  registerUser,
  loginUser,
};