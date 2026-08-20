const env = require("../../env");
const CustomError = require("../errors/custom-error");
const { isTokenValid } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const lang = require("../languages");
const { findUserById } = require("../models/auth");

const attachUser = async (token) => {
  const payload = isTokenValid(token, env.JWT_SECRET);
  const user = await findUserById(payload.user_id);
  if (!user) {
    throw new CustomError(
      null,
      lang.locale.VLD_UNAUTHORIZED,
      StatusCodes.FORBIDDEN,
      "Unauthenticated"
    );
  }
  return user;
};

const authenticate = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(
      new CustomError(
        null,
        lang.locale.VLD_UNAUTHORIZED,
        StatusCodes.FORBIDDEN,
        "Unauthenticated"
      )
    );
  }

  try {
    req.authuser = await attachUser(token);
    next();
  } catch (error) {
    next(
      new CustomError(
        null,
        error.message || lang.locale.VLD_UNAUTHORIZED,
        StatusCodes.FORBIDDEN,
        "Unauthenticated"
      )
    );
  }
};

const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      req.authuser = await attachUser(authHeader.split(" ")[1]);
    } catch {
      req.authuser = null;
    }
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
