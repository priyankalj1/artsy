const asyncWrapper = require("../middlewares/async");
const { getPortfolioLimits } = require("../config/portfolio");

const fetchAppConfig = asyncWrapper(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      portfolio: getPortfolioLimits(),
    },
  });
});

module.exports = {
  fetchAppConfig,
};
