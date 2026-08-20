const { pool } = require("./db");

const getCustomerByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT customer_id, user_id, name, interests, location, created_at, updated_at
     FROM customers WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const createCustomerProfile = async (userId, payload) => {
  const { rows } = await pool.query(
    `INSERT INTO customers (user_id, name, interests, location)
     VALUES ($1, $2, $3, $4)
     RETURNING customer_id, user_id, name, interests, location, created_at, updated_at`,
    [userId, payload.name || "", payload.interests || [], payload.location || ""]
  );
  return rows[0];
};

const updateCustomerProfile = async (userId, payload) => {
  const { rows } = await pool.query(
    `UPDATE customers
     SET name = COALESCE($2, name),
         interests = COALESCE($3, interests),
         location = COALESCE($4, location),
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING customer_id, user_id, name, interests, location, created_at, updated_at`,
    [
      userId,
      payload.name ?? null,
      payload.interests ?? null,
      payload.location ?? null,
    ]
  );
  return rows[0] || null;
};

module.exports = {
  getCustomerByUserId,
  createCustomerProfile,
  updateCustomerProfile,
};
