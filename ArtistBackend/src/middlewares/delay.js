const delayMiddleware =
  (ms = 300) =>
  (req, res, next) => {
    setTimeout(next, ms);
  };

module.exports = delayMiddleware;
