const env = require("../../env.js");
const { createJWTUploads } = require("./jwt");

const normalizeRelativePath = (filePath) => {
  if (!filePath) return null;
  const value = String(filePath).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return value.replace(/^\/+/, "");
};

const getPublicBaseUrl = (req) => {
  if (env.PUBLIC_BASE_URL) {
    return String(env.PUBLIC_BASE_URL).replace(/\/$/, "");
  }
  if (req) {
    const host = req.get("host");
    if (host) {
      return `${req.protocol}://${host}`;
    }
  }
  return `http://127.0.0.1:${env.PORT || 5050}`;
};

/**
 * Associate-style URL:
 * {domain}/{path}?authToken={uploadJwt}
 * e.g. http://host:5050/uploads/artists/1/profile/x.jpg?authToken=...
 */
const buildAuthenticatedFileUrl = (filePath, req, tokenLifetime = "1h") => {
  const relative = normalizeRelativePath(filePath);
  if (!relative) return null;
  if (/^https?:\/\//i.test(relative)) return relative;

  const authToken = createJWTUploads(tokenLifetime);
  const base = getPublicBaseUrl(req);
  return `${base}/${relative}?authToken=${authToken}`;
};

const withAuthenticatedUrls = (paths, req) => {
  const list = Array.isArray(paths) ? paths : [];
  return list
    .map((item) => buildAuthenticatedFileUrl(item, req))
    .filter(Boolean);
};

module.exports = {
  normalizeRelativePath,
  getPublicBaseUrl,
  buildAuthenticatedFileUrl,
  withAuthenticatedUrls,
};
