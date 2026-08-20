const { pool } = require("./db");

const getCategories = async () => {
  const { rows } = await pool.query(
    `SELECT id, name, emoji FROM categories ORDER BY name ASC`
  );
  return rows;
};

const listArtists = async ({
  category,
  location,
  search,
  minRating,
  minPrice,
  maxPrice,
  sort = "rating",
} = {}) => {
  const clauses = [];
  const values = [];
  let idx = 1;

  if (category) {
    clauses.push(
      `(LOWER(category) LIKE $${idx} OR LOWER(COALESCE(subcategory, '')) LIKE $${idx} OR LOWER(category) = $${idx})`
    );
    values.push(`%${String(category).toLowerCase()}%`);
    idx += 1;
  }

  if (location) {
    clauses.push(`LOWER(COALESCE(location, '')) LIKE $${idx}`);
    values.push(`%${String(location).toLowerCase()}%`);
    idx += 1;
  }

  if (search) {
    clauses.push(
      `(LOWER(name) LIKE $${idx} OR LOWER(COALESCE(stage_name, '')) LIKE $${idx} OR LOWER(COALESCE(category, '')) LIKE $${idx} OR LOWER(COALESCE(bio, '')) LIKE $${idx})`
    );
    values.push(`%${String(search).toLowerCase()}%`);
    idx += 1;
  }

  if (minRating) {
    clauses.push(`rating >= $${idx}`);
    values.push(Number(minRating));
    idx += 1;
  }

  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    clauses.push(`price >= $${idx}`);
    values.push(Number(minPrice));
    idx += 1;
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    clauses.push(`(price_type = 'quote' OR price <= $${idx})`);
    values.push(Number(maxPrice));
    idx += 1;
  }

  clauses.unshift(
    `user_id IN (SELECT user_id FROM users WHERE is_onboarded = TRUE)`
  );
  const where = `WHERE ${clauses.join(" AND ")}`;
  const orderBy =
    sort === "price_asc"
      ? "price ASC NULLS LAST"
      : sort === "price_desc"
        ? "price DESC NULLS LAST"
        : sort === "bookings"
          ? "bookings_count DESC"
          : "rating DESC, reviews DESC";

  const { rows } = await pool.query(
    `SELECT * FROM artists ${where} ORDER BY ${orderBy}`,
    values
  );
  return rows;
};

const getArtistById = async (artistId) => {
  const { rows } = await pool.query(
    `SELECT * FROM artists WHERE artist_id = $1 LIMIT 1`,
    [artistId]
  );
  return rows[0] || null;
};

const getArtistByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM artists WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const createArtistProfile = async (userId, payload) => {
  const { rows } = await pool.query(
    `INSERT INTO artists (
       user_id, name, stage_name, bio, category, subcategory, experience,
       languages, events, location, price, price_type,
       travel_allowance, trial_session_fee, team_member_fee,
       portfolio_photos, portfolio_videos,
       profile_photo, id_image, selfie_image, video_interview,
       badges, verified
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11, $12,
       $13, $14, $15,
       $16, $17,
       $18, $19, $20, $21,
       $22, TRUE
     )
     RETURNING *`,
    [
      userId,
      payload.name || "",
      payload.stageName || payload.stage_name || payload.name,
      payload.bio || "",
      payload.category,
      payload.subcategory || "",
      payload.experience || "",
      payload.languages || [],
      payload.events || [],
      payload.location || "",
      payload.price || 0,
      payload.priceType || payload.price_type || "quote",
      payload.travelAllowance || payload.travel_allowance || 0,
      payload.trialSessionFee || payload.trial_session_fee || 0,
      payload.teamMemberFee || payload.team_member_fee || 0,
      payload.portfolioPhotos || payload.portfolio_photos || [],
      payload.portfolioVideos || payload.portfolio_videos || [],
      payload.profilePhoto || payload.profile_photo || null,
      payload.idImage || payload.id_image || null,
      payload.selfieImage || payload.selfie_image || null,
      payload.videoInterview || payload.video_interview || null,
      ["verified"],
    ]
  );
  return rows[0];
};

const updateArtistProfile = async (userId, payload) => {
  const { rows } = await pool.query(
    `UPDATE artists
     SET name = COALESCE($2, name),
         stage_name = COALESCE($3, stage_name),
         bio = COALESCE($4, bio),
         category = COALESCE($5, category),
         experience = COALESCE($6, experience),
         languages = COALESCE($7, languages),
         events = COALESCE($8, events),
         profile_photo = COALESCE($9, profile_photo),
         id_image = COALESCE($10, id_image),
         selfie_image = COALESCE($11, selfie_image),
         location = COALESCE($12, location),
         price = COALESCE($13, price),
         price_type = COALESCE($14, price_type),
         travel_allowance = COALESCE($15, travel_allowance),
         trial_session_fee = COALESCE($16, trial_session_fee),
         team_member_fee = COALESCE($17, team_member_fee),
         portfolio_photos = COALESCE($18, portfolio_photos),
         portfolio_videos = COALESCE($19, portfolio_videos),
         video_interview = COALESCE($20, video_interview),
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    [
      userId,
      payload.name ?? null,
      payload.stageName ?? payload.stage_name ?? null,
      payload.bio ?? null,
      payload.category ?? null,
      payload.experience ?? null,
      payload.languages ?? null,
      payload.events ?? null,
      payload.profilePhoto ?? payload.profile_photo ?? null,
      payload.idImage ?? payload.id_image ?? null,
      payload.selfieImage ?? payload.selfie_image ?? null,
      payload.location ?? null,
      payload.price ?? null,
      payload.priceType ?? payload.price_type ?? null,
      payload.travelAllowance ?? payload.travel_allowance ?? null,
      payload.trialSessionFee ?? payload.trial_session_fee ?? null,
      payload.teamMemberFee ?? payload.team_member_fee ?? null,
      payload.portfolioPhotos ?? payload.portfolio_photos ?? null,
      payload.portfolioVideos ?? payload.portfolio_videos ?? null,
      payload.videoInterview ?? payload.video_interview ?? null,
    ]
  );
  return rows[0] || null;
};

module.exports = {
  getCategories,
  listArtists,
  getArtistById,
  getArtistByUserId,
  createArtistProfile,
  updateArtistProfile,
};
