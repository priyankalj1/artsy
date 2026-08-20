const express = require("express");
const validateRequest = require("../middlewares/validate-request");
const { authenticate } = require("../middlewares/authentication");
const requestLogger = require("../middlewares/request-logger");
const {
  createBookingSchema,
  updateBookingStatusSchema,
} = require("../validations/bookings");
const {
  createNewBooking,
  fetchMyBookings,
  fetchBookingById,
  patchBookingStatus,
} = require("../controllers/bookings");

const router = express.Router();

router.post(
  "/",
  authenticate,
  requestLogger,
  validateRequest(createBookingSchema),
  createNewBooking
);
router.get("/", authenticate, fetchMyBookings);
router.get("/:id", authenticate, fetchBookingById);
router.patch(
  "/:id/status",
  authenticate,
  requestLogger,
  validateRequest(updateBookingStatusSchema),
  patchBookingStatus
);

module.exports = router;
