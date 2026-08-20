const ROLES = {
  ARTIST: "artist",
  USER: "user",
};

const isValidRole = (role) => Object.values(ROLES).includes(role);

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "").trim();

module.exports = {
  ROLES,
  isValidRole,
  normalizePhone,
};
