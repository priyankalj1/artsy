const { pool } = require("./db");

const BOOKING_SELECT = `
  SELECT
    b.*,
    a.name AS artist_name,
    a.category AS artist_category,
    a.stage_name AS artist_stage_name,
    a.price AS artist_price,
    a.price_type AS artist_price_type,
    cu.name AS customer_name,
    cu.phone AS customer_phone
  FROM bookings b
  INNER JOIN artists a ON a.artist_id = b.artist_id
  INNER JOIN users cu ON cu.user_id = b.customer_user_id
`;

const createBooking = async (payload) => {
  const { rows } = await pool.query(
    `INSERT INTO bookings (
       customer_user_id, artist_id, event_date, event_time, duration_hours,
       event_type, location, notes, status, amount, client_name
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
     RETURNING *`,
    [
      payload.customer_user_id,
      payload.artist_id,
      payload.event_date,
      payload.event_time || null,
      payload.duration_hours || 4,
      payload.event_type || "",
      payload.location || "",
      payload.notes || "",
      payload.amount || 0,
      payload.client_name || null,
    ]
  );
  return rows[0];
};

const getBookingById = async (bookingId) => {
  const { rows } = await pool.query(
    `${BOOKING_SELECT} WHERE b.booking_id = $1 LIMIT 1`,
    [bookingId]
  );
  return rows[0] || null;
};

const listBookingsForUser = async (userId, role, status) => {
  const values = [userId];
  let statusClause = "";
  if (status) {
    values.push(status);
    statusClause = ` AND b.status = $${values.length}`;
  }

  if (role === "artist") {
    const { rows } = await pool.query(
      `${BOOKING_SELECT}
       WHERE a.user_id = $1${statusClause}
       ORDER BY b.event_date ASC, b.created_at DESC`,
      values
    );
    return rows;
  }

  const { rows } = await pool.query(
    `${BOOKING_SELECT}
     WHERE b.customer_user_id = $1${statusClause}
     ORDER BY b.event_date ASC, b.created_at DESC`,
    values
  );
  return rows;
};

const updateBookingStatus = async (bookingId, status) => {
  const { rows } = await pool.query(
    `UPDATE bookings
     SET status = $2, updated_at = NOW()
     WHERE booking_id = $1
     RETURNING *`,
    [bookingId, status]
  );
  return rows[0] || null;
};

const getArtistEarnings = async (userId) => {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN b.status IN ('confirmed','completed')
         AND date_trunc('month', b.event_date) = date_trunc('month', CURRENT_DATE)
         THEN b.amount ELSE 0 END), 0)::float AS month_earnings,
       COALESCE(SUM(CASE WHEN b.status IN ('confirmed','completed')
         THEN b.amount ELSE 0 END), 0)::float AS total_earnings,
       COUNT(*) FILTER (
         WHERE b.status IN ('pending','confirmed')
           AND b.event_date >= CURRENT_DATE
       )::int AS upcoming_count,
       COUNT(*) FILTER (
         WHERE b.status = 'pending'
       )::int AS pending_count,
       COUNT(*) FILTER (
         WHERE b.status IN ('confirmed','completed')
           AND date_trunc('month', b.event_date) = date_trunc('month', CURRENT_DATE)
       )::int AS month_bookings
     FROM bookings b
     INNER JOIN artists a ON a.artist_id = b.artist_id
     WHERE a.user_id = $1`,
    [userId]
  );

  const monthly = await pool.query(
    `SELECT to_char(month, 'Mon') AS label, COALESCE(SUM(b.amount), 0)::float AS total
     FROM generate_series(
       date_trunc('month', CURRENT_DATE) - interval '4 months',
       date_trunc('month', CURRENT_DATE),
       interval '1 month'
     ) AS month
     LEFT JOIN artists a ON a.user_id = $1
     LEFT JOIN bookings b
       ON b.artist_id = a.artist_id
      AND b.status IN ('confirmed','completed')
      AND date_trunc('month', b.event_date) = month
     GROUP BY month
     ORDER BY month ASC`,
    [userId]
  );

  return {
    ...(rows[0] || {}),
    monthly: monthly.rows,
  };
};

module.exports = {
  createBooking,
  getBookingById,
  listBookingsForUser,
  updateBookingStatus,
  getArtistEarnings,
};
