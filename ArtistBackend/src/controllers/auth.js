const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../middlewares/async");
const CustomError = require("../errors/custom-error");
const lang = require("../languages");
const { createJWT } = require("../utils/jwt");
const { normalizePhone, isValidRole } = require("../utils/common");
const {
  findUserById,
  updateUser,
  getOtpRequestMeta,
  saveUserOtp,
  getUserOtpRecord,
  incrementOtpVerifyAttempts,
  clearUserOtp,
} = require("../models/auth");
const {
  generateOtp,
  shouldRevealOtp,
  isOtpCooldownActive,
  isOtpExpired,
  OTP_TTL_MINUTES,
  OTP_MAX_VERIFY_ATTEMPTS,
} = require("../services/otp");
const {
  getCustomerByUserId,
  createCustomerProfile,
  updateCustomerProfile,
} = require("../models/users");
const {
  getArtistByUserId,
  createArtistProfile,
  updateArtistProfile,
} = require("../models/artists");
const {
  DOC_TYPES,
  listDocumentsForArtist,
  listDocumentsForUser,
  linkUserDocumentsToArtist,
} = require("../models/documents");
const {
  buildAuthenticatedFileUrl,
  normalizeRelativePath,
} = require("../utils/mediaUrls");
const {
  ALL_STEP_IDS,
  buildOnboarding,
  firstStepForRole,
} = require("../utils/onboarding");

const publicUser = (user) => ({
  user_id: user.user_id,
  phone: user.phone,
  name: user.name,
  role: user.role,
  is_onboarded: user.is_onboarded,
  onboarding_step: user.onboarding_step,
});

const mergeArtistMedia = (artist, docs = []) => {
  if (!artist && !docs.length) return null;
  const byType = (type) =>
    docs.filter((doc) => doc.document_type === type).map((doc) => doc.file_path);
  const base = artist || {};
  const photos = byType(DOC_TYPES.PORTFOLIO_PHOTO);
  const videos = byType(DOC_TYPES.PORTFOLIO_VIDEO);
  return {
    ...base,
    portfolio_photos: photos.length ? photos : base.portfolio_photos || [],
    portfolio_videos: videos.length ? videos : base.portfolio_videos || [],
    profile_photo: byType(DOC_TYPES.PROFILE)[0] || base.profile_photo || null,
    id_image: byType(DOC_TYPES.ID_IMAGE)[0] || base.id_image || null,
    selfie_image: byType(DOC_TYPES.SELFIE)[0] || base.selfie_image || null,
    video_interview:
      byType(DOC_TYPES.VIDEO_INTERVIEW)[0] || base.video_interview || null,
  };
};

const rememberUrl = (previewUrls, path, req) => {
  const relative = normalizeRelativePath(path);
  if (!relative) return "";
  const url = buildAuthenticatedFileUrl(relative, req);
  if (url) previewUrls[relative] = url;
  return relative;
};

const buildDraft = ({ user, customer, artist, req }) => {
  if (user?.role === "user") {
    return {
      name: customer?.name || user?.name || "",
      interests: customer?.interests || [],
      location: customer?.location || "",
    };
  }

  if (user?.role === "artist") {
    const previewUrls = {};
    const photos = (artist?.portfolio_photos || []).map((path) =>
      rememberUrl(previewUrls, path, req)
    );
    const videos = (artist?.portfolio_videos || []).map((path) =>
      rememberUrl(previewUrls, path, req)
    );
    return {
      name: artist?.name || user?.name || "",
      stageName: artist?.stage_name || "",
      bio: artist?.bio || "",
      category: artist?.category || "",
      experience: artist?.experience || "",
      languages: artist?.languages || [],
      events: artist?.events || [],
      location: artist?.location || "",
      priceType: artist?.price_type || "fixed",
      price: artist?.price != null ? String(artist.price) : "",
      travelAllowance:
        artist?.travel_allowance != null ? String(artist.travel_allowance) : "",
      trialSessionFee:
        artist?.trial_session_fee != null ? String(artist.trial_session_fee) : "",
      teamMemberFee:
        artist?.team_member_fee != null ? String(artist.team_member_fee) : "",
      profilePhoto: rememberUrl(previewUrls, artist?.profile_photo, req),
      idImage: rememberUrl(previewUrls, artist?.id_image, req),
      selfieImage: rememberUrl(previewUrls, artist?.selfie_image, req),
      videoInterview: rememberUrl(previewUrls, artist?.video_interview, req),
      portfolioPhotos: photos.filter(Boolean),
      portfolioVideos: videos.filter(Boolean),
      previewUrls,
    };
  }

  return {};
};

const loadOnboardingContext = async (userId, req) => {
  const user = await findUserById(userId);
  if (!user) return null;

  const [customer, artist] = await Promise.all([
    getCustomerByUserId(userId),
    getArtistByUserId(userId),
  ]);

  let docs = [];
  if (artist) {
    docs = await listDocumentsForArtist(artist.artist_id);
  } else {
    docs = await listDocumentsForUser(userId);
  }

  const mergedArtist = mergeArtistMedia(artist, docs);
  const onboarding = buildOnboarding({
    user,
    customer,
    artist: mergedArtist,
  });

  return {
    user,
    customer,
    artist: mergedArtist,
    onboarding,
    draft: buildDraft({ user, customer, artist: mergedArtist, req }),
  };
};

const persistOnboardingStep = async (userId, onboarding) => {
  return updateUser(userId, {
    onboarding_step: onboarding.current_step,
  });
};

const requestOtp = asyncWrapper(async (req, res, next) => {
  const phone = normalizePhone(req.body.phone);

  if (!phone || phone.length < 10) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_INVALID_PHONE,
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }

  const existing = await getOtpRequestMeta(phone);
  if (isOtpCooldownActive(existing?.otp_requested_at)) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_OTP_COOLDOWN,
        StatusCodes.TOO_MANY_REQUESTS,
        "validation"
      )
    );
  }

  const otp = generateOtp();
  await saveUserOtp(phone, otp, OTP_TTL_MINUTES);

  const data = { phone };
  if (shouldRevealOtp()) {
    data.otp = otp;
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "OTP sent successfully",
    data,
  });
});

const verifyOtpCode = asyncWrapper(async (req, res, next) => {
  const phone = normalizePhone(req.body.phone);
  const otp = String(req.body.otp || "").trim();
  const record = await getUserOtpRecord(phone);

  const rejectOtp = (message = lang.locale.VLD_INVALID_OTP) =>
    next(
      new CustomError(null, message, StatusCodes.BAD_REQUEST, "validation")
    );

  if (!record || !record.otp) {
    return rejectOtp();
  }

  if ((record.otp_verify_attempts || 0) >= OTP_MAX_VERIFY_ATTEMPTS) {
    await clearUserOtp(record.user_id);
    return rejectOtp(lang.locale.VLD_OTP_TOO_MANY_ATTEMPTS);
  }

  if (isOtpExpired(record.otp_expiry)) {
    await clearUserOtp(record.user_id);
    return rejectOtp();
  }

  if (String(record.otp) !== otp) {
    const attempts = await incrementOtpVerifyAttempts(record.user_id);
    if (attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      await clearUserOtp(record.user_id);
      return rejectOtp(lang.locale.VLD_OTP_TOO_MANY_ATTEMPTS);
    }
    return rejectOtp();
  }

  await clearUserOtp(record.user_id);
  const user = record;

  const token = createJWT({
    user_id: user.user_id,
    phone: user.phone,
  });

  const context = await loadOnboardingContext(user.user_id, req);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "OTP verified successfully",
    data: {
      token,
      user: publicUser(context.user),
      onboarding: context.onboarding,
      draft: context.draft,
    },
  });
});

const selectRole = asyncWrapper(async (req, res, next) => {
  const { role } = req.body;
  const userId = req.authuser?.user_id;

  if (!isValidRole(role)) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_INVALID_ROLE,
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }

  let user = await updateUser(userId, {
    role,
    onboarding_step: firstStepForRole(role),
  });
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

  if (role === "user") {
    const existing = await getCustomerByUserId(userId);
    if (!existing) {
      await createCustomerProfile(userId, { name: user.name || "" });
    }
  } else {
    const existing = await getArtistByUserId(userId);
    if (!existing) {
      await createArtistProfile(userId, { name: user.name || "" });
    }
  }

  const context = await loadOnboardingContext(userId, req);
  user = await persistOnboardingStep(userId, context.onboarding);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Role selected successfully",
    data: {
      user: publicUser(user),
      onboarding: {
        ...context.onboarding,
        current_step: user.onboarding_step,
      },
      draft: context.draft,
    },
  });
});

const me = asyncWrapper(async (req, res, next) => {
  const context = await loadOnboardingContext(req.authuser.user_id, req);
  if (!context) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        "Functional"
      )
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "User fetched successfully",
    data: {
      user: publicUser(context.user),
      onboarding: context.onboarding,
      draft: context.draft,
      customer: context.customer,
      artist: context.artist,
    },
  });
});

const pickArtistProgress = (data = {}) => {
  const payload = {};
  const keys = [
    "name",
    "stageName",
    "bio",
    "category",
    "experience",
    "languages",
    "events",
    "location",
    "priceType",
    "price",
    "travelAllowance",
    "trialSessionFee",
    "teamMemberFee",
    "profilePhoto",
    "idImage",
    "selfieImage",
    "videoInterview",
    "portfolioPhotos",
    "portfolioVideos",
  ];
  keys.forEach((key) => {
    if (data[key] !== undefined) payload[key] = data[key];
  });
  if (payload.profilePhoto !== undefined) {
    payload.profilePhoto = normalizeRelativePath(payload.profilePhoto);
  }
  if (payload.idImage !== undefined) {
    payload.idImage = normalizeRelativePath(payload.idImage);
  }
  if (payload.selfieImage !== undefined) {
    payload.selfieImage = normalizeRelativePath(payload.selfieImage);
  }
  if (payload.videoInterview !== undefined) {
    payload.videoInterview = normalizeRelativePath(payload.videoInterview);
  }
  if (payload.portfolioPhotos) {
    payload.portfolioPhotos = payload.portfolioPhotos
      .map(normalizeRelativePath)
      .filter(Boolean);
  }
  if (payload.portfolioVideos) {
    payload.portfolioVideos = payload.portfolioVideos
      .map(normalizeRelativePath)
      .filter(Boolean);
  }
  return payload;
};

const saveOnboardingProgress = asyncWrapper(async (req, res, next) => {
  const userId = req.authuser.user_id;
  const step = String(req.body.step || "").trim();
  const data = req.body.data || {};

  if (!ALL_STEP_IDS.includes(step)) {
    return next(
      new CustomError(
        null,
        "Invalid onboarding step",
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }

  let user = await findUserById(userId);
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

  if (step === "role") {
    return next(
      new CustomError(
        null,
        "Use role selection to choose customer or artist",
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }

  if (user.role === "user") {
    const payload = {
      name: data.name !== undefined ? String(data.name).trim() : undefined,
      interests: data.interests,
      location:
        data.location !== undefined ? String(data.location).trim() : undefined,
    };
    const existing = await getCustomerByUserId(userId);
    if (existing) {
      await updateCustomerProfile(userId, payload);
    } else {
      await createCustomerProfile(userId, {
        name: payload.name || user.name || "",
        interests: payload.interests || [],
        location: payload.location || "",
      });
    }
    if (payload.name) {
      await updateUser(userId, { name: payload.name });
    }
  } else if (user.role === "artist") {
    const payload = pickArtistProgress(data);
    let artist = await getArtistByUserId(userId);
    if (artist) {
      artist = await updateArtistProfile(userId, payload);
    } else {
      artist = await createArtistProfile(userId, payload);
    }
    const mediaPaths = [
      payload.profilePhoto,
      payload.idImage,
      payload.selfieImage,
      payload.videoInterview,
      ...(payload.portfolioPhotos || []),
      ...(payload.portfolioVideos || []),
    ].filter(Boolean);
    if (mediaPaths.length) {
      await linkUserDocumentsToArtist(userId, artist.artist_id, mediaPaths);
    }
    if (payload.name) {
      await updateUser(userId, { name: payload.name });
    }
  } else {
    return next(
      new CustomError(
        null,
        "Please select a role first",
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }

  const context = await loadOnboardingContext(userId, req);
  user = await persistOnboardingStep(userId, context.onboarding);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Onboarding progress saved",
    data: {
      user: publicUser(user),
      onboarding: {
        ...context.onboarding,
        current_step: user.onboarding_step,
      },
      draft: context.draft,
    },
  });
});

module.exports = {
  requestOtp,
  verifyOtpCode,
  selectRole,
  me,
  saveOnboardingProgress,
};
