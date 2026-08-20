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

const isOtpCooldownActive = (otpRequestedAt) => {
  if (!otpRequestedAt) return false;
  const requestedAt = new Date(otpRequestedAt).getTime();
  if (Number.isNaN(requestedAt)) return false;
  return Date.now() - requestedAt < OTP_COOLDOWN_MS;
};

const isOtpExpired = (otpExpiry) => {
  if (!otpExpiry) return true;
  return new Date(otpExpiry).getTime() <= Date.now();
};

module.exports = {
  generateOtp,
  shouldRevealOtp,
  isOtpCooldownActive,
  isOtpExpired,
  OTP_TTL_MINUTES,
  OTP_MAX_VERIFY_ATTEMPTS,
};
