import { fetchAppConfigApi } from '../api/config';

export const DEFAULT_PORTFOLIO_LIMITS = {
  minPhotos: 5,
  maxPhotos: 8,
  minVideos: 2,
  maxVideos: 2,
};

let cachedLimits = { ...DEFAULT_PORTFOLIO_LIMITS };

export function getPortfolioLimits() {
  return cachedLimits;
}

export async function loadPortfolioLimits() {
  try {
    const res = await fetchAppConfigApi();
    const portfolio = res?.data?.portfolio;
    if (portfolio) {
      cachedLimits = {
        minPhotos: Number(portfolio.minPhotos) || DEFAULT_PORTFOLIO_LIMITS.minPhotos,
        maxPhotos: Number(portfolio.maxPhotos) || DEFAULT_PORTFOLIO_LIMITS.maxPhotos,
        minVideos: Number(portfolio.minVideos) || DEFAULT_PORTFOLIO_LIMITS.minVideos,
        maxVideos: Number(portfolio.maxVideos) || DEFAULT_PORTFOLIO_LIMITS.maxVideos,
      };
    }
  } catch {
    // Keep defaults if the backend is unreachable.
  }
  return cachedLimits;
}
