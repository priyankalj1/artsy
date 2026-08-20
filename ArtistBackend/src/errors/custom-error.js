const lang = require("../languages");

class CustomError extends Error {
  constructor(
    error,
    message = lang.locale.VLD_SOMETHING_WENT_WRONG,
    statusCode = 500,
    type = "ERROR",
    silentAlert = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = error;
    this.errorType = type;
    this.silentAlert = silentAlert;
  }
}

module.exports = CustomError;
