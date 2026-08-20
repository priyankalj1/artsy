const fs = require("fs");
const path = require("path");
const moment = require("moment");

const logDir = path.join(__dirname, "../../logs/request");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const requestLogger = (req, res, next) => {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const today = moment().format("YYYY-MM-DD");
  const logFile = path.join(logDir, `requests-${today}.log`);

  const requestData = {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const chunks = [];
  const originalSend = res.send;

  res.send = function (chunk) {
    chunks.push(chunk);
    res.send = originalSend;
    return res.send(chunk);
  };

  res.on("finish", () => {
    const responseData = JSON.stringify(
      Buffer.isBuffer(chunks[0]) ? chunks[0].toString("utf8") : chunks[0]
    );
    const logEntry = `${timestamp} - ${req.method} ${req.originalUrl}\nRequest: ${JSON.stringify(
      requestData,
      null,
      2
    )}\nResponse: ${responseData}\n\n`;

    fs.appendFile(logFile, logEntry, (err) => {
      if (err) {
        console.error("Failed to write request log:", err);
      }
    });
  });

  next();
};

module.exports = requestLogger;
