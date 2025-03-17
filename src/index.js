const express = require("express");
const routes = require("./Routes/_index.routes");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(routes);

const port = parseInt(process.env.PORT || 8000, 10);
app.listen(port, () => {
  console.log("Server is running on port :", port);
});
