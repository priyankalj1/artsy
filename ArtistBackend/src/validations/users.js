const Joi = require("joi");

const ALLOWED_INTERESTS = [
  "makeup",
  "mehendi",
  "singer",
  "dancer",
  "dj",
  "photo",
  "mc",
  "choreo",
  "music",
];

const customerOnboardSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s.'-]+$/)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must be at most 100 characters",
      "string.pattern.base":
        "Name can only contain letters, spaces, and . ' -",
      "any.required": "Name is required",
    }),
  interests: Joi.array()
    .items(
      Joi.string()
        .valid(...ALLOWED_INTERESTS)
        .messages({
          "any.only": "One or more selected interests are invalid",
        })
    )
    .min(1)
    .max(ALLOWED_INTERESTS.length)
    .unique()
    .required()
    .messages({
      "array.min": "Select at least one interest",
      "array.unique": "Interests must be unique",
      "any.required": "Interests are required",
    }),
  location: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Location is required",
      "string.min": "Location must be at least 2 characters",
      "string.max": "Location must be at most 100 characters",
      "any.required": "Location is required",
    }),
});

module.exports = {
  customerOnboardSchema,
  ALLOWED_INTERESTS,
};
