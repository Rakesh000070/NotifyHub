// Import the User model.
// We use this model to interact with the "users" collection in MongoDB.
const User = require("../models/User");
const bcrypt = require("bcryptjs");


// Controller function to handle user registration.
// This function runs when a client sends a registration request.
const registerUser = async (req, res) => {
  try {
    // Extract user data (name, email, password) from the request body.
    // Example request body:
    // {
    //   "name": "Rakesh",
    //   "email": "rakesh@gmail.com",
    //   "password": "123456"
    // }
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

if (existingUser) {
    return res.status(400).json({
        success: false,
        message: "User already exists try to login or use another email to successfully register",
    });
}
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user document in the MongoDB database.
    // User.create() saves the data and returns the newly created document.
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,// Store the hashed password instead of the plain text password.
    });

    newUser.password = undefined;// Hide the password field before sending the response.

    // If user creation is successful, send a success response.
    // Status Code: 201 = Resource Created Successfully.
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
     // Return the created user data to the client.
      user: newUser,
    });
  } catch (error) {
    // If any error occurs (database error, validation error, etc.),
    // this block catches the error and prevents the server from crashing.

    // Status Code: 500 = Internal Server Error.
    res.status(500).json({
      success: false,

      // Send the actual error message for debugging.
      message: error.message,
    });
  }
};

// Export the controller function so it can be used in routes.
module.exports = {
  registerUser,
};