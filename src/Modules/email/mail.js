const nodemailer = require("nodemailer");
const {
  verifymailTemplate,
  welcomeMailTemplate,
  recentLoginMailTemplate,
} = require("./mailTemplates");
const { getCurrentDateTime } = require("../util/getDeviceDetails");

const verificationMail = async (email, verificationCode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Changed to false for TLS
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: { name: "Admin", address: process.env.USER },
      to: email,
      subject: "Account Verification",
      text: "Welcome",
      html: verifymailTemplate.replace("{verificationCode}", verificationCode),
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
};

const welcomeMail = async (username, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Changed to false for TLS
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: { name: "Admin", address: process.env.USER },
      to: email,
      subject: "Welcome to linkeka",
      text: "Welcome",
      html: welcomeMailTemplate.replace("{name}", username),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
};

const sendLoginNotification = async (username, email) => {
  try {
    const dateTime = getCurrentDateTime();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: { name: "Admin", address: process.env.USER },
      to: email,
      subject: "Recent Login Detected",
      html: recentLoginMailTemplate
        .replace("{time}", dateTime)
        .replace("{name}", username),
    };

    await transporter.sendMail(mailOptions);
    console.log("Login notification email sent to:", email);
  } catch (error) {
    console.error("Error sending login notification:", error);
  }
};

const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Changed to false for TLS
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: { name: "Admin", address: process.env.USER },
      to: email,
      subject: "Reset Your Password",
      html: `Click <a href="${resetURL}">here</a> to reset your password`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
};

const sendResetSuccessEmail = async (email, resetURL) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Changed to false for TLS
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: { name: "Admin", address: process.env.USER },
      to: email,
      subject: "Password Reset Was Successfully",
      html: `Your password was reset successfully`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

module.exports = {
  verificationMail,
  welcomeMail,
  sendLoginNotification,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
};
