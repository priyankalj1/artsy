const { pool } = require("./db");

const DOC_TYPES = {
  PROFILE: "profile",
  PORTFOLIO_PHOTO: "portfolio_photo",
  PORTFOLIO_VIDEO: "portfolio_video",
  ID_IMAGE: "id_image",
  SELFIE: "selfie",
  VIDEO_INTERVIEW: "video_interview",
};

const createDocument = async ({
  userId,
  artistId = null,
  documentType,
  filePath,
  mimeType = null,
  fileSize = 0,
  sortOrder = 0,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO documents (
       user_id, artist_id, document_type, file_path, mime_type, file_size, sort_order
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userId,
      artistId,
      documentType,
      filePath,
      mimeType,
      fileSize || 0,
      sortOrder || 0,
    ]
  );
  return rows[0];
};

const listDocumentsForArtist = async (artistId, types = null) => {
  if (types?.length) {
    const { rows } = await pool.query(
      `SELECT * FROM documents
       WHERE artist_id = $1 AND document_type = ANY($2::text[])
       ORDER BY sort_order ASC, created_at ASC`,
      [artistId, types]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `SELECT * FROM documents
     WHERE artist_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [artistId]
  );
  return rows;
};

const listDocumentsForUser = async (userId, types = null) => {
  if (types?.length) {
    const { rows } = await pool.query(
      `SELECT * FROM documents
       WHERE user_id = $1 AND document_type = ANY($2::text[])
       ORDER BY sort_order ASC, created_at ASC`,
      [userId, types]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `SELECT * FROM documents
     WHERE user_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [userId]
  );
  return rows;
};

const linkUserDocumentsToArtist = async (userId, artistId, filePaths = []) => {
  if (!filePaths.length) {
    const { rows } = await pool.query(
      `UPDATE documents
       SET artist_id = $2, updated_at = NOW()
       WHERE user_id = $1 AND artist_id IS NULL
       RETURNING *`,
      [userId, artistId]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `UPDATE documents
     SET artist_id = $2, updated_at = NOW()
     WHERE user_id = $1
       AND file_path = ANY($3::text[])
     RETURNING *`,
    [userId, artistId, filePaths]
  );
  return rows;
};

const getLatestProfilePathsForArtists = async (artistIds) => {
  if (!artistIds?.length) return {};

  const { rows } = await pool.query(
    `SELECT DISTINCT ON (artist_id)
       artist_id, file_path
     FROM documents
     WHERE artist_id = ANY($1::int[])
       AND document_type = $2
     ORDER BY artist_id, created_at DESC`,
    [artistIds, DOC_TYPES.PROFILE]
  );

  return rows.reduce((acc, row) => {
    acc[row.artist_id] = row.file_path;
    return acc;
  }, {});
};

module.exports = {
  DOC_TYPES,
  createDocument,
  listDocumentsForArtist,
  listDocumentsForUser,
  linkUserDocumentsToArtist,
  getLatestProfilePathsForArtists,
};
