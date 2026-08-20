const env = require("../../env");

function parseCount(value, fallback) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function range(minRaw, maxRaw, minFallback, maxFallback) {
  let min = parseCount(minRaw, minFallback);
  let max = parseCount(maxRaw, maxFallback);
  if (min > max) {
    const swapped = min;
    min = max;
    max = swapped;
  }
  return { min, max };
}

function getPortfolioLimits() {
  const photos = range(
    env.MIN_PORTFOLIO_PHOTOS,
    env.MAX_PORTFOLIO_PHOTOS,
    5,
    8
  );
  const videos = range(
    env.MIN_PORTFOLIO_VIDEOS,
    env.MAX_PORTFOLIO_VIDEOS,
    2,
    2
  );

  return {
    minPhotos: photos.min,
    maxPhotos: photos.max,
    minVideos: videos.min,
    maxVideos: videos.max,
  };
}

module.exports = {
  getPortfolioLimits,
};
