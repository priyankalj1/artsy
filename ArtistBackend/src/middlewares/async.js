const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/custom-error");
const lang = require("../languages");

const asyncWrapper = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(
      new CustomError(
        error,
        lang.locale.VLD_SOMETHING_WENT_WRONG,
        StatusCodes.BAD_REQUEST,
        "Functional"
      )
    );
  }
};

module.exports = asyncWrapper;
