const express = require("express");

const auth = require("../apis/auth");
const users = require("../apis/users");
const artists = require("../apis/artists");
const bookings = require("../apis/bookings");
const uploads = require("../apis/uploads");
const config = require("../apis/config");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/artists", artists);
router.use("/bookings", bookings);
router.use("/uploads", uploads);
router.use("/config", config);

module.exports = router;
