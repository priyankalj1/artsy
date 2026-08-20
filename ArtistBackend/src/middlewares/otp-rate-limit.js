const rateLimit = require("express-rate-limit");
const env = require("../../env");

const otpRequestLimiter = rateLimit({
  windowMs: (env.OTP_RATE_WINDOW_MINUTES || 15) * 60 * 1000,
  max: env.OTP_REQUEST_MAX || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
    statusCode: 429,
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: (env.OTP_RATE_WINDOW_MINUTES || 15) * 60 * 1000,
  max: env.OTP_VERIFY_MAX || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again later.",
    statusCode: 429,
  },
});

module.exports = {
  otpRequestLimiter,
  otpVerifyLimiter,
};
