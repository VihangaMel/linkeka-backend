# Authentication and Authorization feature

This tutorial covers how to set up and use a JSON Web Token (JWT)-based authentication system in a Node.js Express application. We will go through each module step-by-step.

### Prerequisites

**To follow this tutorial, you’ll need:**

- Basic knowledge of JavaScript and Node.js.
- Node.js installed.
- Express and other dependencies (express-async-handler, jsonwebtoken, bcryptjs).

### Step 1: Setting Up Environment Variables

Create a .env file to store secret keys and other sensitive information.

```
ACCESS_TOKEN_SECRET=your_jwt_secret_key
ACCESS_TOKEN_LIFE_TIME=1h
BCRYPT_SALT_ROUNDS=10
```

### Step 2: Middleware - JWT Authentication (Auth.js)

In the Middleware folder, create the Auth.js file to handle JWT authentication. This middleware checks the token’s validity and attaches user data to the request object.

```js
// Middleware/Auth.js
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const auth = asyncHandler(async (req, res, next) => {
  let accessToken;

  const requiredHeaders =
    res.hasHeader("Authorization") || res.hasHeader("authorization");
  if (requiredHeaders) {
    return res.status(401).json({
      error: "Authorization header is missing. Please provide a valid token.",
    });
  }
  const authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    accessToken = authHeader.split(" ")[1];
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: "Token verification failed. User is not authorized.",
        });
      }

      req.user = {
        username: decoded.username,
        email: decoded.email,
        id: decoded.id,
      };
      next();
    });
  } else {
    if (!accessToken) {
      return res
        .status(401)
        .json({ error: "Invalid authorization format. Use 'Bearer <token>'." });
    }
  }
});

module.exports = auth;
```

### Step 3: Controller - Authentication Logic (authController.js)

This file manages registration, login, and testing JWT validation.

```js
// controllers/authController.js
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../../Models/userModel");
const isValidEmail = require("./validators/emailValidation");
const usernameValidation = require("./validators/usernameValidation");
const passwordValidation = require("./validators/passwordValidation");

// Register
const register = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;
  const notAllRequiredObjects = !username || !email || !password;
  if (notAllRequiredObjects) {
    return res
      .status(400)
      .json({ error: "All fields (username, email, password) are required." });
  }

  // Username Validation
  const char = usernameValidation.valid_characters(username);
  const length = usernameValidation.valid_length(username);
  const noSpace = usernameValidation.no_white_space(username);

  const result = char && length && noSpace;
  if (!result) {
    return res.status(400).json({
      error:
        "Invalid username. It must contain valid characters, have a proper length, and not contain spaces.",
    });
  }

  try {
    // Check for unique username
    const usernameResult = await userModel.findOne({ username });
    if (usernameResult) {
      return res.status(400).json({
        error:
          "This username is already taken. Please choose a different username.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      error:
        "Internal server error while checking the username. Please try again later.",
    });
  }

  // Email Validation
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Invalid email address. Please provide a valid email." });
  }
  try {
    const emailResult = await userModel.findOne({ email });
    if (emailResult) {
      return res.status(400).json({
        error:
          "This email is already registered. Please use a different email address.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      error:
        "Internal server error while checking the email. Please try again later.",
    });
  }

  // Password Validation and Hashing
  const password_length = passwordValidation.valid_length(password);
  if (!password_length) {
    return res.status(400).json({
      error:
        "Invalid password length. Password must be at least 8 characters long.",
    });
  }
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  );

  try {
    await userModel.create({ username, name, email, password: hashedPassword });
    res.status(200).json({ message: "User account created successfully." });
  } catch (err) {
    return res.status(500).json({
      error:
        "Internal server error while creating account. Please try again later.",
    });
  }
});

// Login
const login = asyncHandler(async (req, res) => {
  const { userUnique, password } = req.body;
  const notAllRequiredObjects = !userUnique || !password;
  if (notAllRequiredObjects) {
    return res.status(400).json({
      error:
        "All fields userUnique (username or email) and password are required.",
    });
  }

  try {
    let result;
    if (isValidEmail(userUnique)) {
      result = await userModel.findOne({ email: userUnique });
    } else {
      if (
        !usernameValidation.valid_characters(userUnique) ||
        !usernameValidation.valid_length(userUnique) ||
        !usernameValidation.no_white_space(userUnique)
      ) {
        return res.status(400).json({
          error:
            "Invalid username. It must contain valid characters, have a proper length, and not contain spaces.",
        });
      }
      result = await userModel.findOne({ username: userUnique });
    }

    if (result && (await bcrypt.compare(password, result.password))) {
      const accessToken = jwt.sign(
        {
          username: result.username,
          email: result.email,
          id: result.id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_LIFE_TIME }
      );
      return res.status(200).json({ accessToken });
    } else {
      return res
        .status(401)
        .json({ error: "Username/email or password not valid." });
    }
  } catch (error) {
    return res.status(500).json({
      error:
        "Internal server error while comparing user details. Please try again later.",
    });
  }
});

// Auth Test
const testAuth = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json({ message: "Access token verified. Test passed." });
});

module.exports = { register, login, testAuth };
```

### Step 4: Routes - Defining Authentication Endpoints (authRouter.js)

Create routes for registration, login, and testing the token.

```js
// routes/authRouter.js
const express = require("express");
const authController = require("../controllers/authController");
const Auth = require("../Middleware/Auth");
const auth_router = express.Router();

auth_router.post("/login", authController.login);
auth_router.post("/register", authController.register);
auth_router.post("/test", Auth, authController.testAuth);

module.exports = auth_router;
```

### Step 5: Starting the Server (server.js)

Finally, configure the server to use the routes.

```js
// server.js
const express = require("express");
const authRouter = require("./routes/authRouter");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Testing

#### Registration

**_POST /api/auth/register_**

- Body:

```js
{
 "username": "user123",
 "name": "User Name",
 "email": "user@example.com",
 "password": "securepassword123"
}

```

### Login

POST /api/auth/login

- Body:

```js
{
 "userUnique": "user@example.com",
 "password": "securepassword123"
}

```

### Token Verification

POST /api/auth/test

Header: `Authorization: Bearer <access_token
