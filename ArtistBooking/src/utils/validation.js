import { CATEGORIES } from '../data/mockData';
import { USER_ROLES } from '../constants/auth';
import { getPortfolioLimits } from '../config/portfolioLimits';

export const ALLOWED_INTERESTS = CATEGORIES.map(category => category.id);

export const ALLOWED_LOCATIONS = [
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'HSR Layout',
  'Jayanagar',
];

export function validatePhone(phone) {
  const trimmed = String(phone || '').replace(/\D/g, '');

  if (!trimmed) {
    return { valid: false, error: 'Please enter your phone number.' };
  }

  if (!/^[6-9]\d{9}$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Enter a valid 10-digit Indian mobile number.',
    };
  }

  return { valid: true, value: trimmed };
}

export function validateOtp(otp) {
  const trimmed = String(otp || '').trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter the OTP.' };
  }

  if (!/^\d{4}$/.test(trimmed)) {
    return { valid: false, error: 'OTP must be 4 digits.' };
  }

  return { valid: true, value: trimmed };
}

export function validateRole(role) {
  if (!Object.values(USER_ROLES).includes(role)) {
    return { valid: false, error: 'Please select a valid role.' };
  }
  return { valid: true, value: role };
}

export function validateCustomerName(name) {
  const trimmed = String(name || '').trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter your name.' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters.' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name must be at most 100 characters.' };
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: "Name can only contain letters, spaces, and . ' -",
    };
  }

  return { valid: true, value: trimmed };
}

export function validateInterests(interests) {
  if (!Array.isArray(interests) || interests.length === 0) {
    return { valid: false, error: 'Select at least one interest.' };
  }

  const unique = [...new Set(interests)];
  const invalid = unique.filter(item => !ALLOWED_INTERESTS.includes(item));

  if (invalid.length) {
    return { valid: false, error: 'One or more interests are invalid.' };
  }

  return { valid: true, value: unique };
}

export function validateLocation(location) {
  const trimmed = String(location || '').trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter your location.' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Location must be at least 2 characters.' };
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      error: 'Location must be at most 100 characters.',
    };
  }

  return { valid: true, value: trimmed };
}

export function validateCustomerOnboard({ name, interests, location }) {
  const nameResult = validateCustomerName(name);
  if (!nameResult.valid) return nameResult;

  const interestsResult = validateInterests(interests);
  if (!interestsResult.valid) return interestsResult;

  const locationResult = validateLocation(location);
  if (!locationResult.valid) return locationResult;

  return {
    valid: true,
    value: {
      name: nameResult.value,
      interests: interestsResult.value,
      location: locationResult.value,
    },
  };
}

export const EXPERIENCE_OPTIONS = [
  '1–2 years',
  '3–5 years',
  '5–8 years',
  '8+ years',
];

export const LANGUAGE_OPTIONS = [
  'Kannada',
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
];

export const EVENT_OPTIONS = [
  'Wedding',
  'Reception',
  'Sangeet',
  'Corporate',
  'Birthday',
];

function toMoneyNumber(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

export function validateArtistStep(step, form) {
  if (step === 0) {
    const nameResult = validateCustomerName(form.name);
    if (!nameResult.valid) return nameResult;
    const bio = String(form.bio || '').trim();
    if (bio.length < 10) {
      return { valid: false, error: 'Bio must be at least 10 characters.' };
    }
    return { valid: true };
  }

  if (step === 1) {
    if (!ALLOWED_INTERESTS.includes(form.category)) {
      return { valid: false, error: 'Please select a category.' };
    }
    return { valid: true };
  }

  if (step === 2) {
    if (!EXPERIENCE_OPTIONS.includes(form.experience)) {
      return { valid: false, error: 'Please select your experience.' };
    }
    if (!Array.isArray(form.languages) || form.languages.length === 0) {
      return { valid: false, error: 'Select at least one language.' };
    }
    if (!Array.isArray(form.events) || form.events.length === 0) {
      return { valid: false, error: 'Select at least one event type.' };
    }
    return { valid: true };
  }

  if (step === 3) {
    const { minPhotos, minVideos } = getPortfolioLimits();
    if (
      !Array.isArray(form.portfolioPhotos) ||
      form.portfolioPhotos.length < minPhotos
    ) {
      return {
        valid: false,
        error: `Upload at least ${minPhotos} portfolio photo${
          minPhotos === 1 ? '' : 's'
        }.`,
      };
    }
    if (
      !Array.isArray(form.portfolioVideos) ||
      form.portfolioVideos.length < minVideos
    ) {
      return {
        valid: false,
        error: `Upload at least ${minVideos} portfolio video${
          minVideos === 1 ? '' : 's'
        }.`,
      };
    }
    return { valid: true };
  }

  if (step === 4) {
    if (!['fixed', 'quote'].includes(form.priceType)) {
      return { valid: false, error: 'Please choose a pricing type.' };
    }
    if (form.priceType === 'fixed') {
      const price = toMoneyNumber(form.price);
      if (!Number.isFinite(price) || price <= 0) {
        return {
          valid: false,
          error: 'Enter a valid base price greater than 0.',
        };
      }
    }
    return { valid: true };
  }

  if (step === 5) {
    if (!form.idImage) {
      return { valid: false, error: 'Government ID is required.' };
    }
    if (!form.selfieImage) {
      return { valid: false, error: 'Selfie verification is required.' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Invalid step.' };
}

export function validateArtistOnboard(form) {
  for (let step = 0; step <= 5; step += 1) {
    const result = validateArtistStep(step, form);
    if (!result.valid) return result;
  }

  return {
    valid: true,
    value: {
      name: String(form.name).trim(),
      stageName: String(form.stageName || '').trim(),
      bio: String(form.bio).trim(),
      category: form.category,
      experience: form.experience,
      languages: form.languages,
      events: form.events,
      portfolioPhotos: form.portfolioPhotos,
      portfolioVideos: form.portfolioVideos,
      priceType: form.priceType,
      price: form.priceType === 'fixed' ? toMoneyNumber(form.price) : 0,
      travelAllowance: toMoneyNumber(form.travelAllowance),
      trialSessionFee: toMoneyNumber(form.trialSessionFee),
      teamMemberFee: toMoneyNumber(form.teamMemberFee),
      idImage: form.idImage,
      selfieImage: form.selfieImage,
    },
  };
}
