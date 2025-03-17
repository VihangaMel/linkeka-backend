const express = require("express");
const userController = require("../Controllers/userController");
const auth = require("../Modules/Middleware/Auth/Auth");
const router = express.Router();

//login
router.post("/login", userController.login);

//Register
router.post("/register", userController.register);

//Verify mail
router.post("/verify-email", auth, userController.VerifyEmail);

//Resend verification
router.post("/resend-verify-mail",auth, userController.resendVerificationCode);

//Logout
router.post("/logout", userController.logout);

//Forgot password
router.post("/forgot-password", userController.forgotPassword);

//Reset password
router.post("/reset-password/:token", userController.resetPassword);

//Get single user
router.get("/user", auth, userController.getUserData);

//get all users
router.get("/users", userController.getAllUsers);

//Check auth
router.get("/check-auth",auth, userController.checkAuth)

module.exports = router;
