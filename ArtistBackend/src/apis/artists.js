const express = require("express");
const validateRequest = require("../middlewares/validate-request");
const { authenticate } = require("../middlewares/authentication");
const requestLogger = require("../middlewares/request-logger");
const { artistOnboardSchema } = require("../validations/artists");
const {
  fetchCategories,
  fetchArtists,
  fetchArtistById,
  fetchArtistGallery,
  onboardArtist,
  getMyArtistProfile,
  fetchEarnings,
} = require("../controllers/artists");

const router = express.Router();

router.get("/categories", fetchCategories);
router.get("/", fetchArtists);
router.get("/me", authenticate, getMyArtistProfile);
router.get("/earnings", authenticate, fetchEarnings);
router.get("/:id/gallery", fetchArtistGallery);
router.get("/:id", fetchArtistById);
router.post(
  "/onboard",
  authenticate,
  requestLogger,
  validateRequest(artistOnboardSchema),
  onboardArtist
);

module.exports = router;
