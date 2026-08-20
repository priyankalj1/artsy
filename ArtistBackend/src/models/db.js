const { Pool } = require("pg");
const env = require("../../env.js");

const passwordPart =
  env.DB_PASSWORD !== undefined && env.DB_PASSWORD !== null && env.DB_PASSWORD !== ""
    ? `:${encodeURIComponent(env.DB_PASSWORD)}`
    : "";

const isLocalEnv = ["DEV", "UAT", "LOCAL"].includes(
  String(env.ENVIRONMENT || "").toUpperCase()
);

const connectionString = isLocalEnv
  ? `postgresql://${env.DB_USER}${passwordPart}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}?sslmode=disable`
  : `postgresql://${env.DB_USER}${passwordPart}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`;

const pool = new Pool({
  connectionString,
  ssl: isLocalEnv ? false : { rejectUnauthorized: false },
});

const checkDatabaseConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

const ensureSchema = async () => {
  await pool.query(
    `ALTER TABLE users
     ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50) DEFAULT 'role'`
  );
  await pool.query(
    `ALTER TABLE users
     ADD COLUMN IF NOT EXISTS otp VARCHAR(8)`
  );
  await pool.query(
    `ALTER TABLE users
     ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP`
  );
  await pool.query(
    `ALTER TABLE users
     ADD COLUMN IF NOT EXISTS otp_requested_at TIMESTAMP`
  );
  await pool.query(
    `ALTER TABLE users
     ADD COLUMN IF NOT EXISTS otp_verify_attempts INTEGER DEFAULT 0`
  );
  await pool.query(
    `UPDATE users
     SET onboarding_step = 'complete'
     WHERE is_onboarded = TRUE AND onboarding_step IS DISTINCT FROM 'complete'`
  );
  await pool.query(
    `UPDATE users
     SET onboarding_step = 'role'
     WHERE is_onboarded = FALSE AND role IS NULL AND COALESCE(onboarding_step, '') = ''`
  );
};

module.exports = {
  pool,
  checkDatabaseConnection,
  ensureSchema,
};
