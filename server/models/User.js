const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },

    {
       /*
    timestamps: true

    Mongoose automatically creates:
    1. createdAt -> Stores the document creation date.
    2. updatedAt -> Updates automatically whenever the document is edited.

    No need to manually manage these fields.
  */
        timestamps: true,   
    }
);

module.exports = mongoose.model("user", userSchema);