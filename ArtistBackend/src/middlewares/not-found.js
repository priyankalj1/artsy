const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");

const notFound = (req, res, next) =>
  next(
    new CustomError(
      null,
      "Route does not exist",
      StatusCodes.NOT_FOUND,
      "Not Found"
    )
  );

module.exports = notFound;
