const jwt = require("jsonwebtoken");
const env = require("../../env.js");

const createJWT = (payload, time = null, secret = null) => {
  const jwtSecret = secret || env.JWT_SECRET;
  const expiresIn = time || env.JWT_LIFETIME;
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

const isTokenValid = (token, secret, ignoreexpiry = false) =>
  jwt.verify(token, secret ? secret : env.JWT_SECRET, {
    ignoreExpiration: ignoreexpiry,
  });

const createJWTUploads = (time = "1m") => {
  const authToken = jwt.sign({}, env.UPLOAD_SECRET_KEY, { expiresIn: time });
  return authToken;
};

const verifyJWTUploads = (token) => {
  if (!token) return false;
  try {
    jwt.verify(token, env.UPLOAD_SECRET_KEY);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  isTokenValid,
  createJWT,
  createJWTUploads,
  verifyJWTUploads,
};
