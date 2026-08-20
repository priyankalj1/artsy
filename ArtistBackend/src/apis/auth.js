const express = require("express");
const validateRequest = require("../middlewares/validate-request");
const { authenticate } = require("../middlewares/authentication");
const requestLogger = require("../middlewares/request-logger");
const {
  requestOtpSchema,
  verifyOtpSchema,
  selectRoleSchema,
  onboardingProgressSchema,
} = require("../validations/auth");
const {
  requestOtp,
  verifyOtpCode,
  selectRole,
  me,
  saveOnboardingProgress,
} = require("../controllers/auth");
const {
  otpRequestLimiter,
  otpVerifyLimiter,
} = require("../middlewares/otp-rate-limit");

const router = express.Router();

router.post(
  "/otp/request",
  otpRequestLimiter,
  requestLogger,
  validateRequest(requestOtpSchema),
  requestOtp
);
router.post(
  "/otp/verify",
  otpVerifyLimiter,
  requestLogger,
  validateRequest(verifyOtpSchema),
  verifyOtpCode
);
router.post(
  "/role",
  authenticate,
  requestLogger,
  validateRequest(selectRoleSchema),
  selectRole
);
router.get("/me", authenticate, me);
router.post(
  "/onboarding/progress",
  authenticate,
  requestLogger,
  validateRequest(onboardingProgressSchema),
  saveOnboardingProgress
);

module.exports = router;
