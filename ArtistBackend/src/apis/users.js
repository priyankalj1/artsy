const express = require("express");
const validateRequest = require("../middlewares/validate-request");
const { authenticate } = require("../middlewares/authentication");
const requestLogger = require("../middlewares/request-logger");
const { customerOnboardSchema } = require("../validations/users");
const {
  onboardCustomer,
  getMyCustomerProfile,
} = require("../controllers/users");

const router = express.Router();

router.post(
  "/onboard",
  authenticate,
  requestLogger,
  validateRequest(customerOnboardSchema),
  onboardCustomer
);
router.get("/me", authenticate, getMyCustomerProfile);

module.exports = router;
