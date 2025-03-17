const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const userModel = require("../Models/userModel");
const isValidEmail = require("../Modules/validators/emailValidation");
const usernameValidation = require("../Modules/validators/usernameValidation");
const passwordValidation = require("../Modules/validators/passwordValidation");
const {
  verificationMail,
  welcomeMail,
  sendLoginNotification,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} = require("../Modules/email/mail");
const generateVerificationCode = require("../Modules/util/generateVerificationCode");
const generateToken = require("../Modules/util/generateJWTToken");
const crypto = require("crypto");

const register = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;
  const notAllRequiredObjects = !username || !email || !password;
  if (notAllRequiredObjects) {
    return res.status(400).json({
      success: false,
      message: "All fields (username, email, password) are required.",
    });
  }

  // Username Validation
  const char = usernameValidation.valid_characters(username);
  const noSpace = usernameValidation.no_white_space(username);

  const result = char && noSpace;
  if (!result) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid username. It must contain valid characters, have a proper length, and not contain spaces.",
    });
  }

  try {
    // Check for unique username
    const usernameResult = await userModel.findOne({ username: username });
    if (usernameResult) {
      return res.status(400).json({
        success: false,
        message:
          "This username is already taken. Please choose a different username.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Internal server error while checking the username. Please try again later.",
    });
  }

  // Email Validation
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address. Please provide a valid email.",
    });
  }
  try {
    // Check for unique email
    const emailResult = await userModel.findOne({ email: email });
    if (emailResult) {
      return res.status(400).json({
        success: false,
        message:
          "This email is already registered. Please use a different email address.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Internal server error while checking the email. Please try again later.",
    });
  }

  // Password Validation
  const password_length = passwordValidation.valid_length(password);
  if (!password_length) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid password length. Password must be at least 8 characters long.",
    });
  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationCode = generateVerificationCode();

  await verificationMail(email, verificationCode);

  //  Create new User account
  try {
    const user = new userModel({
      username: username,
      name: name,
      email: email,
      password: hashedPassword,
      verificationCode: verificationCode,
      verificationCodeExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    await user.save();

    const token = generateToken(res, username, email);

    res
      .json({
        success: true,
        message: "User created successfully",
      })
      .status(201);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        "Internal server error while create account. Please try again later.",
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const notAllRequiredObjects = !username || !password;
  if (notAllRequiredObjects) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const user = await userModel.findOne({ username });

    if (user) {
      const isVerified = user.verified;
      if (!isVerified) {
        return res.send({
          message: "Your email is not verified. PLease verify your email.",
        });
      }

      if (await bcrypt.compare(password, user.password)) {
        const username = user.username;
        const email = user.email;
        const id = user.id;

        const token = generateToken(res, username, email, id);
        await sendLoginNotification(username, email);

        return res
          .status(200)
          .json({ success: true, token: token, message: "Login successful" });
      } else {
        return res.status(401).json({
          success: false,
          message: "Password is incorrect please try again.",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Can't find user, Please provide valid username",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

const VerifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;
  try {
    const user = await userModel.findOne({
      verificationCode: code,
      verificationCodeExpiresAt: { $gt: Date.now() },
    });

    const wantToVerifyUser = await userModel.findOne({
      username: req.username,
    });
    const isMatch = wantToVerifyUser.verificationCode == code;

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Verification code is wrong. Please provide correct code!",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expired verification code",
      });
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    await welcomeMail(user.username, user.email);

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ success: true, message: error.message });
  }
});

const getUserData = asyncHandler(async (req, res) => {
  try {
    const user = await userModel.findOne({ username: req.username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, user: { ...user._doc, password: undefined } });
  } catch (error) {
    return res.send({ error: "Server error" });
  }
});

const resendVerificationCode = asyncHandler(async (req, res) => {
  try {
    const user = await userModel.findOne({ username:req.username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "You are not registed. Please register first.",
      });
    }

    const isVerified = (user.verified == true);

    if (isVerified) {
      return res
        .status(200)
        .json({ success: true, message: "You are already verified" });
    }

    const verificationCode = generateVerificationCode();
    await verificationMail(user.email, verificationCode);
    console.log(user.email)

    user.verificationCode = verificationCode;
    user.verificationCodeExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    res.status(200).json({ success: true, message: "Verification code sent." });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Server error:" + error.message });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const resetPasswordCode = crypto.randomBytes(32).toString("hex");
    const resetPasswordCodeExpiresAt = Date.now() + 10 * 60 * 1000; //10 min

    user.resetPasswordCode = resetPasswordCode;
    user.resetPasswordCodeExpiresAt = resetPasswordCodeExpiresAt;

    await user.save();
    await sendPasswordResetEmail(
      user.email,
      `${process.env.BASE_URL}/reset-password/${resetPasswordCode}`
    );

    res
      .status(200)
      .json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Server error" });
    console.log(error.message);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await userModel.findOne({
      resetPasswordCode: token,
      resetPasswordCodeExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({ success: true, message: "Password is reseted" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error sending email",
      Error: error.message,
    });
  }
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await userModel.find();
    res.send(users).status(200);
  } catch (error) {
    return res.send({ success: false, message: "Server error" }).status(400);
  }
});

const checkAuth = asyncHandler(async (req, res) => {
  try {
    const user = await userModel.findOne({ username: req.username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = {
  register,
  login,
  VerifyEmail,
  getAllUsers,
  getUserData,
  resendVerificationCode,
  logout,
  forgotPassword,
  resetPassword,
  checkAuth,
};
