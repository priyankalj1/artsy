export const ARTIST_STEP_BY_INDEX = [
  'profile',
  'category',
  'experience',
  'portfolio',
  'pricing',
  'verify',
];

export const CUSTOMER_STEP_BY_INDEX = ['name', 'interests', 'location'];

export const ARTIST_STEP_INDEX = {
  profile: 0,
  category: 1,
  experience: 2,
  portfolio: 3,
  pricing: 4,
  verify: 5,
};

export const CUSTOMER_STEP_INDEX = {
  name: 0,
  interests: 1,
  location: 2,
};

export function uploadedPaths(paths = []) {
  return paths.filter(
    path =>
      path &&
      !String(path).startsWith('file:') &&
      !String(path).startsWith('ph:') &&
      !String(path).startsWith('content:'),
  );
}

export function resumeArtistStepIndex(currentStep, editStep) {
  if (typeof editStep === 'number') {
    return editStep;
  }
  if (currentStep === 'complete' || currentStep === 'verify') {
    return ARTIST_STEP_INDEX.verify;
  }
  if (currentStep === 'role' || !currentStep) {
    return ARTIST_STEP_INDEX.profile;
  }
  return ARTIST_STEP_INDEX[currentStep] ?? 0;
}

export function resumeCustomerStepIndex(currentStep, editStep) {
  if (typeof editStep === 'number') {
    return editStep;
  }
  if (currentStep === 'complete' || currentStep === 'location') {
    return CUSTOMER_STEP_INDEX.location;
  }
  if (currentStep === 'role' || !currentStep) {
    return CUSTOMER_STEP_INDEX.name;
  }
  return CUSTOMER_STEP_INDEX[currentStep] ?? 0;
}

export function artistProgressPayload(form = {}) {
  return {
    name: form.name,
    stageName: form.stageName,
    bio: form.bio,
    category: form.category,
    experience: form.experience,
    languages: form.languages,
    events: form.events,
    profilePhoto: form.profilePhoto,
    portfolioPhotos: uploadedPaths(form.portfolioPhotos),
    portfolioVideos: uploadedPaths(form.portfolioVideos),
    priceType: form.priceType,
    price: form.priceType === 'fixed' ? Number(form.price) || 0 : 0,
    travelAllowance: Number(form.travelAllowance) || 0,
    trialSessionFee: Number(form.trialSessionFee) || 0,
    teamMemberFee: Number(form.teamMemberFee) || 0,
    idImage: form.idImage,
    selfieImage: form.selfieImage,
    videoInterview: form.videoInterview,
  };
}
