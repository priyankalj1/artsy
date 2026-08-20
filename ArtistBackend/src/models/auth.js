const { pool } = require("./db");

const USER_COLUMNS = `user_id, phone, name, role, is_onboarded, onboarding_step, created_at, updated_at`;

const findUserByPhone = async (phone) => {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS}
     FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  );
  return rows[0] || null;
};

const findUserById = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS}
     FROM users WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const createUser = async ({ phone, name = null, role = null }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (phone, name, role, is_onboarded, onboarding_step)
     VALUES ($1, $2, $3, FALSE, 'role')
     RETURNING ${USER_COLUMNS}`,
    [phone, name, role]
  );
  return rows[0];
};

const updateUser = async (userId, updates) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (
      ["name", "role", "is_onboarded", "phone", "onboarding_step"].includes(key)
    ) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (!fields.length) {
    return findUserById(userId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(", ")}
     WHERE user_id = $${idx}
     RETURNING ${USER_COLUMNS}`,
    values
  );
  return rows[0] || null;
};

const getOtpRequestMeta = async (phone) => {
  const { rows } = await pool.query(
    `SELECT user_id, otp_requested_at
     FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  );
  return rows[0] || null;
};

const saveUserOtp = async (phone, otp, expiryMinutes) => {
  const { rows } = await pool.query(
    `INSERT INTO users (
       phone, otp, otp_expiry, otp_requested_at, otp_verify_attempts,
       is_onboarded, onboarding_step
     )
     VALUES (
       $1, $2, NOW() + ($3::int * INTERVAL '1 minute'), NOW(), 0,
       FALSE, 'role'
     )
     ON CONFLICT (phone) DO UPDATE SET
       otp = EXCLUDED.otp,
       otp_expiry = EXCLUDED.otp_expiry,
       otp_requested_at = NOW(),
       otp_verify_attempts = 0,
       updated_at = NOW()
     RETURNING ${USER_COLUMNS}`,
    [phone, otp, expiryMinutes]
  );
  return rows[0];
};

const getUserOtpRecord = async (phone) => {
  const { rows } = await pool.query(
    `SELECT user_id, phone, name, role, is_onboarded, onboarding_step,
            otp, otp_expiry, otp_verify_attempts
     FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  );
  return rows[0] || null;
};

const incrementOtpVerifyAttempts = async (userId) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET otp_verify_attempts = COALESCE(otp_verify_attempts, 0) + 1,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING otp_verify_attempts`,
    [userId]
  );
  return rows[0]?.otp_verify_attempts ?? 0;
};

const clearUserOtp = async (userId) => {
  await pool.query(
    `UPDATE users
     SET otp = NULL,
         otp_expiry = NULL,
         otp_verify_attempts = 0,
         updated_at = NOW()
     WHERE user_id = $1`,
    [userId]
  );
};

module.exports = {
  findUserByPhone,
  findUserById,
  createUser,
  updateUser,
  getOtpRequestMeta,
  saveUserOtp,
  getUserOtpRecord,
  incrementOtpVerifyAttempts,
  clearUserOtp,
};
