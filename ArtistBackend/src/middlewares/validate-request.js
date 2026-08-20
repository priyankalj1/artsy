const CustomError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");

const validateRequest = (schema) => (req, res, next) => {
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    return next(
      new CustomError(
        validationResult.error.details,
        validationResult.error.details[0].message,
        StatusCodes.BAD_REQUEST,
        "validation"
      )
    );
  }
  next();
};

module.exports = validateRequest;
