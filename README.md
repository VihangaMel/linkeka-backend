# Linkeka Backend Documentation

## Project Overview

This backend project is built with Express.js for fast and minimal web server functionality. It incorporates several libraries to handle various tasks like logging, error handling, parsing cookies, and testing.

### Frameworks and Libraries Used

1. Express.js

   - Version: ~4.16.1

   - Description: Express is a lightweight web application framework for Node.js that simplifies routing and middleware management.

   - Usage:

   - It serves as the core framework of the project to create the server and handle HTTP requests.
   - Example from the project (app.js)

     ```js
     const express = require("express");
     const app = express();

     app.get("/", (req, res) => {
       res.send("Welcome to the Linkeka Backend!");
     });

     module.exports = app;
     ```

- Learn More: Express.js [Documentation](https://expressjs.com/)

2.  Morgan

    - Version: ~1.9.1

    - Description: Morgan is an HTTP request logger middleware for > Node.js.

    - Usage: Helps log requests to the console for better > debugging and monitoring.
      >
    - Example usage:

    ```js
    const morgan = require("morgan");
    app.use(morgan("dev"));
    ```

    - Learn More: [Morgan on NPM](https://www.npmjs.com/package/morgan)

3.  Cookie-Parser

    - Version: ~1.4.4

    - Description: A middleware to parse cookies attached to the client request object.

    - Usage: Extracts cookies from incoming requests, useful when handling sessions.

    - Example usage:

    ```js
    const cookieParser = require("cookie-parser");
    app.use(cookieParser());
    ```

    - Learn More: [Cookie-Parser on NP](https://www.npmjs.com/package/cookie-parser)

4.  Debug - Version: ~2.6.9

    - Description: A small library for debug logging within Node.js applications.

    - Usage: Enables conditional logging using environment variables.

    - Example:

      ```js
      const debug = require("debug")("linkeka-backend");
      debug("Application is running");
      ```

    - Learn More: [Debug on NPM](https://www.npmjs.com/package/debug)

5.  Http-Errors - Version: ~1.6.3

    - Description: A utility to create HTTP error objects easily.

    - Usage: Used to create standardized HTTP error responses for the API.

    - Example:

      ```js
      const createError = require("http-errors");
      app.use((req, res, next) => {
        next(createError(404));
      });
      ```

    - Learn More: [Http-Errors on NPM](https://www.npmjs.com/package/http-errors)

6.  Pug - Version: ~1.11.0

    - Description: A template engine for rendering dynamic HTML views.

    - Usage: Used to generate HTML views from templates.

    - Example from views/index.jade:

      ```jade
      html
          head
              title Linkeka Backend
          body
              h1 Welcome to Linkeka Backend

      ```

    - Learn More: [Jade (Pug) Documentation](https://pugjs.org/)

7.  MySQL2 - Version: ~3.11.3

    - Description: A MySQL client for Node.js with promise support, providing fast and easy database interaction.

    - Usage: Used to connect and perform SQL queries with MySQL databases.

    - Example from db/connection.js:

    ```js
    const mysql = require("mysql2/promise");

    // Create a MySQL connection pool
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "password123",
      database: "linkeka_db",
    });

    async function testConnection() {
      try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully!");
        connection.release();
      } catch (error) {
        console.error("Database connection failed:", error);
      }
    }

    testConnection();
    ```

    - Learn More: [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)

### Development and Testing Tools

1.  Jest

    - Version: ^29.7.0

    - Description: A testing framework to run unit tests and ensure code quality.

    - Usage: Write tests to verify functionality of modules and routes.

    - Example test in tests/app.test.js:

      ````js
      const request = require('supertest');
      const app = require('../src/app');

              test('GET / should return welcome message', async () => {
                  const res = await request(app).get('/');
                  expect(res.statusCode).toBe(200);
                  expect(res.text).toBe('Welcome to the Linkeka Backend!');
              });

              ```

      ````

    - Learn More: [Jest Documentation](https://jestjs.io/)

2.  JSDoc

    - Version: ^4.0.3

    - Description: A tool to generate documentation from code comments.

    - Usage:
      Add JSDoc comments in your code, and run the following command to generate HTML documentation:

      ```bash
      npm run docs
      ```

    - Example JSDoc comment:
      ```js
      /**
       * Home route that sends a welcome message.
       * @route GET /
       * @returns {string} Welcome message
       */
      app.get("/", (req, res) => {
        res.send("Welcome to my Express app!");
      });
      ```
    - Learn More: [JSDoc Documentation](https://jsdoc.app/)

3.  Nodemon - Version: ~3.0.0

    - Description: A tool that automatically restarts a Node.js application when file changes are detected, improving the development workflow.

    - Usage: Used during development to avoid manually restarting the server after code changes.

    - Example from package.json (Script Configuration):

    ```json
    {
      "scripts": {
        "start": "node index.js",
        "dev": "nodemon index.js"
      }
    }
    ```

    - Example Run Command:

    ```bash
    npm run dev
    ```

    - Learn More: [Nodemon Documentation](https://nodemon.io/)

    ### How to Run the Project

    - Install Dependencies:

      ```bash
      npm install
      ```

    - Start the Server:
      ```bash
      npm start
      ```
    - Run Tests:
      ```bash
      npm test
      ```
    - Generate Documentation:
      ```bash
      npm run docs
      ```
      ###### This will create a docs/ folder with the generated HTML documentation.

### Project Repository

- GitHub: [linkeka-backend](https://github.com/craftwarelab/linkeka-backend.git)

### Issues and Bugs

For any bugs or issues, please report them [here](https://github.com/craftwarelab/linkeka-backend/issues)

🔄 Note:
This document should be continuously updated 🛠️ by developers to reflect:

- 📦 Changes in dependencies
- 🆕 New libraries added
- ⬆️ Updates to existing libraries
- ⚡ Keeping this documentation current ensures smooth onboarding 👥 and better collaboration 🤝.
