const express = require("express");
const { authenticate } = require("../middlewares/authentication");
const requestLogger = require("../middlewares/request-logger");
const { uploadFile } = require("../controllers/uploads");

const router = express.Router();

router.post("/", authenticate, requestLogger, uploadFile);

module.exports = router;
