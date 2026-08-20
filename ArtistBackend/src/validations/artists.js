const Joi = require("joi");
const { getPortfolioLimits } = require("../config/portfolio");

const { minPhotos, maxPhotos, minVideos, maxVideos } = getPortfolioLimits();

const ALLOWED_CATEGORIES = [
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

const EXPERIENCE_OPTIONS = [
  "1–2 years",
  "3–5 years",
  "5–8 years",
  "8+ years",
];

const artistOnboardSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s.'-]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Name can only contain letters, spaces, and . ' -",
    }),
  stageName: Joi.string().trim().allow("").max(100),
  bio: Joi.string().trim().min(10).max(200).required(),
  category: Joi.string()
    .valid(...ALLOWED_CATEGORIES)
    .required(),
  experience: Joi.string()
    .valid(...EXPERIENCE_OPTIONS)
    .required(),
  languages: Joi.array().items(Joi.string().trim()).min(1).required(),
  events: Joi.array().items(Joi.string().trim()).min(1).required(),
  portfolioPhotos: Joi.array()
    .items(Joi.string())
    .min(minPhotos)
    .max(maxPhotos)
    .required(),
  portfolioVideos: Joi.array()
    .items(Joi.string())
    .min(minVideos)
    .max(maxVideos)
    .required(),
  priceType: Joi.string().valid("fixed", "quote").required(),
  price: Joi.when("priceType", {
    is: "fixed",
    then: Joi.number().positive().required(),
    otherwise: Joi.number().min(0).default(0),
  }),
  travelAllowance: Joi.number().min(0).default(0),
  trialSessionFee: Joi.number().min(0).default(0),
  teamMemberFee: Joi.number().min(0).default(0),
  profilePhoto: Joi.string().allow("", null),
  idImage: Joi.string().required(),
  selfieImage: Joi.string().required(),
  videoInterview: Joi.string().allow("", null),
  location: Joi.string().allow("").max(100),
});

module.exports = {
  artistOnboardSchema,
  ALLOWED_CATEGORIES,
  EXPERIENCE_OPTIONS,
};
