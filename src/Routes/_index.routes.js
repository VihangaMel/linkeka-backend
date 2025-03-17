const { Router } = require("express");
const userRoutes = require("./user.routes");

const router = Router();

router.use("/user/", userRoutes);

module.exports = router;
