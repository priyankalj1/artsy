const CustomError = require("../errors/custom-error");
const { generateLog } = require("../utils");

// eslint-disable-next-line no-unused-vars
const errorHandlerMiddleware = (err, req, res, next) => {
  console.log("\n\n\n++++++++++++++++++++++++++++++++++++++++++++\n\n\n");
  console.log(err);
  console.log("\n\n\n++++++++++++++++++++++++++++++++++++++++++++\n\n\n");

  if (err instanceof CustomError) {
    const user_id = req.authuser?.user_id ?? null;
    const errorParams = {
      statusCode: err.statusCode,
      message: err.message,
      url: req.url,
      user_id,
      body: {
        ...(req.body || {}),
        user_id,
      },
      query: req.query,
      params: req.params,
      errorType: err.errorType,
      errorStack: err.originalError,
      silentAlert: err.silentAlert,
    };

    if (err.errorType !== "Unauthenticated") {
      generateLog(errorParams, "Functional");
    }

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      silent: err.silentAlert,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong!",
    statusCode: 500,
  });
};

module.exports = errorHandlerMiddleware;
