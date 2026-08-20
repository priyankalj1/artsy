const Joi = require("joi");

const phoneRule = Joi.string()
  .trim()
  .pattern(/^[6-9]\d{9}$/)
  .required()
  .messages({
    "string.empty": "Phone number is required",
    "string.pattern.base": "Enter a valid 10-digit Indian mobile number",
    "any.required": "Phone number is required",
  });

const requestOtpSchema = Joi.object({
  phone: phoneRule,
});

const verifyOtpSchema = Joi.object({
  phone: phoneRule,
  otp: Joi.string()
    .trim()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      "string.empty": "OTP is required",
      "string.pattern.base": "OTP must be 4 digits",
      "any.required": "OTP is required",
    }),
});

const selectRoleSchema = Joi.object({
  role: Joi.string().valid("artist", "user").required().messages({
    "any.only": "Role must be artist or user",
    "any.required": "Role is required",
  }),
});

const onboardingProgressSchema = Joi.object({
  step: Joi.string()
    .valid(
      "role",
      "name",
      "interests",
      "location",
      "profile",
      "category",
      "experience",
      "portfolio",
      "pricing",
      "verify"
    )
    .required(),
  data: Joi.object().unknown(true).default({}),
});

module.exports = {
  requestOtpSchema,
  verifyOtpSchema,
  selectRoleSchema,
  onboardingProgressSchema,
};
