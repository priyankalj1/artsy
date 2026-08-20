module.exports = {
  ENVIRONMENT: 'DEV',
  PORT: 5050,

  DB_USER: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_HOST: '127.0.0.1',
  DB_PORT: 5432,
  DB_DATABASE: 'serverArt',

  USE_MEMORY_STORE: true,

  JWT_SECRET: 'change-me-to-a-long-secret',
  JWT_LIFETIME: '7d',
  UPLOAD_SECRET_KEY: 'change-me-upload-secret',
  PUBLIC_BASE_URL: '',

  LANG: 'english',
  OTP_EXPIRY: 5,
  OTP_COOLDOWN_SECONDS: 60,
  OTP_MAX_VERIFY_ATTEMPTS: 5,
  OTP_RATE_WINDOW_MINUTES: 15,
  OTP_REQUEST_MAX: 5,
  OTP_VERIFY_MAX: 10,

  ALLOWED_ORIGINS: '*',

  // Production defaults: 5–8 photos, 2 videos. Use 1 for local testing.
  MIN_PORTFOLIO_PHOTOS: 5,
  MAX_PORTFOLIO_PHOTOS: 8,
  MIN_PORTFOLIO_VIDEOS: 2,
  MAX_PORTFOLIO_VIDEOS: 2,

  ERROR_ALERT: false,
  ERROR_LOG_EMAIL: '',
  FROM_EMAIL: '',
  MSG_MAIL_DOMAIN: '',
  ERROR_LOG_TEMPLATE_ID: '',
};
