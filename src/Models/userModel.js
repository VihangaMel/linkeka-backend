const mongoose = require("../Database/Connections/Connection");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [
        true,
        "The username is required. Please provide a unique username.",
      ],
      unique: [
        true,
        "This username is already in use. Please choose a different username.",
      ],
    },
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: [
        true,
        "The email address is required. Please provide a valid email address.",
      ],
      unique: [
        true,
        "This email address is already registered. Please use a different email address.",
      ],
    },
    password: {
      type: String,
      required: [
        true,
        "The password is required. Please provide a strong password with a mix of letters, numbers, and special characters.",
      ],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpiresAt: Date,
    resetPasswordCode: String,
    resetPasswordCodeExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
