const jwt = require("jsonwebtoken");

const generateToken = (res, username, email, id) => {
  const token = jwt.sign(
    { username, email, id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_LIFE_TIME }
  );

  res.cookie("token", token),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

  return token;
};

module.exports = generateToken;
