const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../middlewares/async");
const CustomError = require("../errors/custom-error");
const lang = require("../languages");
const { updateUser, findUserById } = require("../models/auth");
const {
  getCategories,
  listArtists,
  getArtistById,
  getArtistByUserId,
  createArtistProfile,
  updateArtistProfile,
} = require("../models/artists");
const { getArtistEarnings } = require("../models/bookings");
const {
  DOC_TYPES,
  listDocumentsForArtist,
  linkUserDocumentsToArtist,
  getLatestProfilePathsForArtists,
} = require("../models/documents");
const {
  buildAuthenticatedFileUrl,
  withAuthenticatedUrls,
  normalizeRelativePath,
} = require("../utils/mediaUrls");

const collectMediaPaths = (payload = {}) => {
  const paths = [
    payload.profilePhoto || payload.profile_photo,
    payload.idImage || payload.id_image,
    payload.selfieImage || payload.selfie_image,
    payload.videoInterview || payload.video_interview,
    ...(payload.portfolioPhotos || payload.portfolio_photos || []),
    ...(payload.portfolioVideos || payload.portfolio_videos || []),
  ]
    .map(normalizeRelativePath)
    .filter(Boolean);

  return [...new Set(paths)];
};

const enrichArtistListItem = (artist, profilePath, req) => {
  const path = profilePath || artist.profile_photo;
  return {
    ...artist,
    profile_photo: buildAuthenticatedFileUrl(path, req) || artist.profile_photo,
    // Keep list payload light — gallery is loaded on detail
    portfolio_photos: [],
    portfolio_videos: [],
  };
};

const enrichArtistDetail = async (artist, req) => {
  const docs = await listDocumentsForArtist(artist.artist_id);
  const byType = (type) =>
    docs.filter((d) => d.document_type === type).map((d) => d.file_path);

  const portfolioPhotos =
    byType(DOC_TYPES.PORTFOLIO_PHOTO).length > 0
      ? byType(DOC_TYPES.PORTFOLIO_PHOTO)
      : artist.portfolio_photos || [];
  const portfolioVideos =
    byType(DOC_TYPES.PORTFOLIO_VIDEO).length > 0
      ? byType(DOC_TYPES.PORTFOLIO_VIDEO)
      : artist.portfolio_videos || [];
  const profilePath =
    byType(DOC_TYPES.PROFILE)[0] || artist.profile_photo || null;

  const documents = docs.map((doc) => ({
    document_id: doc.document_id,
    document_type: doc.document_type,
    path: doc.file_path,
    url: buildAuthenticatedFileUrl(doc.file_path, req),
    mime_type: doc.mime_type,
    sort_order: doc.sort_order,
  }));

  return {
    ...artist,
    profile_photo: buildAuthenticatedFileUrl(profilePath, req),
    portfolio_photos: withAuthenticatedUrls(portfolioPhotos, req),
    portfolio_videos: withAuthenticatedUrls(portfolioVideos, req),
    id_image: buildAuthenticatedFileUrl(
      byType(DOC_TYPES.ID_IMAGE)[0] || artist.id_image,
      req
    ),
    selfie_image: buildAuthenticatedFileUrl(
      byType(DOC_TYPES.SELFIE)[0] || artist.selfie_image,
      req
    ),
    video_interview: buildAuthenticatedFileUrl(
      byType(DOC_TYPES.VIDEO_INTERVIEW)[0] || artist.video_interview,
      req
    ),
    documents,
  };
};

const fetchCategories = asyncWrapper(async (req, res) => {
  const categories = await getCategories();
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Categories fetched successfully",
    data: { categories },
  });
});

const fetchArtists = asyncWrapper(async (req, res) => {
  const artists = await listArtists({
    category: req.query.category,
    location: req.query.location,
    search: req.query.search,
    minRating: req.query.minRating,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    sort: req.query.sort,
  });

  const profileMap = await getLatestProfilePathsForArtists(
    artists.map((a) => a.artist_id)
  );

  const enriched = artists.map((artist) =>
    enrichArtistListItem(artist, profileMap[artist.artist_id], req)
  );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artists fetched successfully",
    data: { artists: enriched, count: enriched.length },
  });
});

const fetchArtistById = asyncWrapper(async (req, res, next) => {
  const artist = await getArtistById(req.params.id);
  if (!artist) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_ARTIST_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  const enriched = await enrichArtistDetail(artist, req);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist fetched successfully",
    data: { artist: enriched },
  });
});

const fetchArtistGallery = asyncWrapper(async (req, res, next) => {
  const artist = await getArtistById(req.params.id);
  if (!artist) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_ARTIST_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  const docs = await listDocumentsForArtist(artist.artist_id, [
    DOC_TYPES.PORTFOLIO_PHOTO,
    DOC_TYPES.PORTFOLIO_VIDEO,
    DOC_TYPES.PROFILE,
  ]);

  const gallery = docs.map((doc) => ({
    document_id: doc.document_id,
    document_type: doc.document_type,
    path: doc.file_path,
    url: buildAuthenticatedFileUrl(doc.file_path, req),
    mime_type: doc.mime_type,
  }));

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist gallery fetched successfully",
    data: {
      artist_id: artist.artist_id,
      gallery,
      photos: gallery
        .filter((g) => g.document_type === DOC_TYPES.PORTFOLIO_PHOTO)
        .map((g) => g.url),
      videos: gallery
        .filter((g) => g.document_type === DOC_TYPES.PORTFOLIO_VIDEO)
        .map((g) => g.url),
    },
  });
});

const onboardArtist = asyncWrapper(async (req, res, next) => {
  const userId = req.authuser.user_id;
  const user = await findUserById(userId);

  if (!user) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  const payload = {
    ...req.body,
    name: String(req.body.name || "").trim(),
    stageName: String(req.body.stageName || "").trim(),
    bio: String(req.body.bio || "").trim(),
    profilePhoto: normalizeRelativePath(
      req.body.profilePhoto || req.body.profile_photo
    ),
    idImage: normalizeRelativePath(req.body.idImage || req.body.id_image),
    selfieImage: normalizeRelativePath(
      req.body.selfieImage || req.body.selfie_image
    ),
    videoInterview: normalizeRelativePath(
      req.body.videoInterview || req.body.video_interview
    ),
    portfolioPhotos: (req.body.portfolioPhotos || req.body.portfolio_photos || [])
      .map(normalizeRelativePath)
      .filter(Boolean),
    portfolioVideos: (req.body.portfolioVideos || req.body.portfolio_videos || [])
      .map(normalizeRelativePath)
      .filter(Boolean),
  };

  let artist = await getArtistByUserId(userId);
  if (artist) {
    artist = await updateArtistProfile(userId, payload);
  } else {
    artist = await createArtistProfile(userId, payload);
  }

  await linkUserDocumentsToArtist(
    userId,
    artist.artist_id,
    collectMediaPaths(payload)
  );

  const updatedUser = await updateUser(userId, {
    name: payload.name,
    role: "artist",
    is_onboarded: true,
    onboarding_step: "complete",
  });

  const enriched = await enrichArtistDetail(artist, req);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist onboarded successfully",
    data: {
      user: updatedUser,
      artist: enriched,
    },
  });
});

const getMyArtistProfile = asyncWrapper(async (req, res, next) => {
  const artist = await getArtistByUserId(req.authuser.user_id);
  if (!artist) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_ARTIST_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  const enriched = await enrichArtistDetail(artist, req);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist profile fetched",
    data: { artist: enriched },
  });
});

const fetchEarnings = asyncWrapper(async (req, res, next) => {
  if (req.authuser.role !== "artist") {
    return next(
      new CustomError(
        null,
        "Earnings are available for artists only",
        StatusCodes.FORBIDDEN,
        "Functional"
      )
    );
  }

  const artist = await getArtistByUserId(req.authuser.user_id);
  const earnings = await getArtistEarnings(req.authuser.user_id);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Earnings fetched successfully",
    data: {
      artist,
      earnings,
    },
  });
});

module.exports = {
  fetchCategories,
  fetchArtists,
  fetchArtistById,
  fetchArtistGallery,
  onboardArtist,
  getMyArtistProfile,
  fetchEarnings,
};
