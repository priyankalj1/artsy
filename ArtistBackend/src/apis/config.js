const express = require("express");
const { fetchAppConfig } = require("../controllers/config");

const router = express.Router();

router.get("/", fetchAppConfig);

module.exports = router;
