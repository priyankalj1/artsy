const fs = require("fs");
const path = require("path");
const moment = require("moment");

const logDir = path.join(__dirname, "../../logs/errors");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const generateLog = (errorObj, type = "Functional") => {
  try {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const today = moment().format("YYYY-MM-DD");
    const logFile = path.join(logDir, `errors-${today}.log`);

    const entry = {
      timestamp,
      type,
      ...errorObj,
      errorStack:
        errorObj.errorStack instanceof Error
          ? {
              message: errorObj.errorStack.message,
              stack: errorObj.errorStack.stack,
            }
          : errorObj.errorStack,
    };

    fs.appendFileSync(logFile, `${JSON.stringify(entry, null, 2)}\n\n`);
  } catch (err) {
    console.error("Failed to write error log:", err.message);
  }
};

const getLocation = () => null;

module.exports = {
  generateLog,
  getLocation,
};
