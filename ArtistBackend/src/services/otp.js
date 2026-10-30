const crypto = require("crypto");
const env = require("../../env");

const OTP_TTL_MINUTES = env.OTP_EXPIRY || 5;
const OTP_COOLDOWN_MS = (env.OTP_COOLDOWN_SECONDS || 60) * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = env.OTP_MAX_VERIFY_ATTEMPTS || 5;

const generateOtp = () => String(crypto.randomInt(1000, 10000));

const shouldRevealOtp = () => {
  const environment = String(env.ENVIRONMENT || "").toUpperCase();
  return environment === "DEV" || environment === "UAT" || environment === "LOCAL";
};

const getOtpCooldownRemainingSeconds = (otpRequestedAt) => {
  if (!otpRequestedAt) return 0;
  const requestedAt = new Date(otpRequestedAt).getTime();
  if (Number.isNaN(requestedAt)) return 0;
  const remainingMs = OTP_COOLDOWN_MS - (Date.now() - requestedAt);
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / 1000);
};

const isOtpCooldownActive = (otpRequestedAt) =>
  getOtpCooldownRemainingSeconds(otpRequestedAt) > 0;

const isOtpExpired = (otpExpiry) => {
  if (!otpExpiry) return true;
  return new Date(otpExpiry).getTime() <= Date.now();
};

module.exports = {
  generateOtp,
  shouldRevealOtp,
  isOtpCooldownActive,
  getOtpCooldownRemainingSeconds,
  isOtpExpired,
  OTP_TTL_MINUTES,
  OTP_COOLDOWN_SECONDS: Math.round(OTP_COOLDOWN_MS / 1000),
  OTP_MAX_VERIFY_ATTEMPTS,
};
