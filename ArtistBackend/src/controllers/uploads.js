const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../middlewares/async");
const CustomError = require("../errors/custom-error");
const { saveUploadedFile } = require("../utils/fileUtils");
const { createDocument, DOC_TYPES } = require("../models/documents");
const { getArtistByUserId } = require("../models/artists");
const { buildAuthenticatedFileUrl } = require("../utils/mediaUrls");

const ALLOWED_DOC_TYPES = new Set(Object.values(DOC_TYPES));

const folderForDocType = (userId, docType) => {
  switch (docType) {
    case DOC_TYPES.PROFILE:
      return `artists/${userId}/profile`;
    case DOC_TYPES.PORTFOLIO_PHOTO:
      return `artists/${userId}/portfolio`;
    case DOC_TYPES.PORTFOLIO_VIDEO:
      return `artists/${userId}/portfolio-videos`;
    case DOC_TYPES.ID_IMAGE:
      return `artists/${userId}/id`;
    case DOC_TYPES.SELFIE:
      return `artists/${userId}/selfie`;
    case DOC_TYPES.VIDEO_INTERVIEW:
      return `artists/${userId}/interview`;
    default:
      return `artists/${userId}/misc`;
  }
};

const uploadFile = asyncWrapper(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(
      new CustomError(
        null,
        "No file uploaded. Use form field name 'file'.",
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }

  const docType = String(req.body.doc_type || req.body.folder || "misc")
    .trim()
    .toLowerCase();

  if (!ALLOWED_DOC_TYPES.has(docType)) {
    return next(
      new CustomError(
        null,
        `Invalid doc_type. Allowed: ${[...ALLOWED_DOC_TYPES].join(", ")}`,
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }

  const userId = req.authuser.user_id;
  const artist = await getArtistByUserId(userId);
  const file = req.files.file;
  const folder = folderForDocType(userId, docType);
  const saved = await saveUploadedFile(file, folder);

  const document = await createDocument({
    userId,
    artistId: artist?.artist_id || null,
    documentType: docType,
    filePath: saved.path,
    mimeType: saved.mimetype,
    fileSize: saved.size,
  });

  const fullUrl = buildAuthenticatedFileUrl(saved.path, req, "1h");

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "File uploaded successfully",
    data: {
      document_id: document.document_id,
      document_type: document.document_type,
      // Relative path stored in DB (associate-style)
      path: saved.path,
      documentUrl: saved.path,
      // Browser/app-ready URL with authToken
      fullUrl,
      fullDocumentUrl: fullUrl,
      mime_type: saved.mimetype,
      size: saved.size,
    },
  });
});

module.exports = {
  uploadFile,
};
