import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES } from '../data/mockData';
import { onboardArtist, fetchOnboardingStatus, saveOnboardingProgress } from '../auth/authService';
import { colors } from '../theme/colors';
import UploadTile from '../components/UploadTile';
import { openCamera } from '../utils/openCamera';
import { uploadDocumentApi } from '../api/uploads';
import {
  validateArtistOnboard,
  validateArtistStep,
} from '../utils/validation';
import {
  getPortfolioLimits,
  loadPortfolioLimits,
} from '../config/portfolioLimits';
import {
  ARTIST_STEP_BY_INDEX,
  artistProgressPayload,
  resumeArtistStepIndex,
} from '../constants/onboarding';

const STEPS = [
  'Profile',
  'Category',
  'Experience',
  'Portfolio',
  'Pricing',
  'Verify',
];

const EXPERIENCE_OPTIONS = ['1–2 years', '3–5 years', '5–8 years', '8+ years'];
const LANGUAGE_OPTIONS = ['Kannada', 'Hindi', 'English', 'Tamil', 'Telugu'];
const EVENT_OPTIONS = ['Wedding', 'Reception', 'Sangeet', 'Corporate', 'Birthday'];

export default function ArtistOnboardScreen({
  route,
  navigation,
  onAuthenticated,
}) {
  const draft = route.params?.draft || {};
  const [step, setStep] = useState(route.params?.initialStep ?? 0);
  const [name, setName] = useState(draft.name || '');
  const [stageName, setStageName] = useState(draft.stageName || '');
  const [bio, setBio] = useState(draft.bio || '');
  const [category, setCategory] = useState(draft.category || '');
  const [experience, setExperience] = useState(draft.experience || '');
  const [languages, setLanguages] = useState(draft.languages || []);
  const [events, setEvents] = useState(draft.events || []);
  const [profilePhoto, setProfilePhoto] = useState(draft.profilePhoto || '');
  const [portfolioPhotos, setPortfolioPhotos] = useState(
    draft.portfolioPhotos || [],
  );
  const [portfolioVideos, setPortfolioVideos] = useState(
    draft.portfolioVideos || [],
  );
  const [priceType, setPriceType] = useState(draft.priceType || 'fixed');
  const [price, setPrice] = useState(draft.price || '');
  const [travelAllowance, setTravelAllowance] = useState(
    draft.travelAllowance || '',
  );
  const [trialSessionFee, setTrialSessionFee] = useState(
    draft.trialSessionFee || '',
  );
  const [teamMemberFee, setTeamMemberFee] = useState(draft.teamMemberFee || '');
  const [idImage, setIdImage] = useState(draft.idImage || '');
  const [selfieImage, setSelfieImage] = useState(draft.selfieImage || '');
  const [videoInterview, setVideoInterview] = useState(
    draft.videoInterview || '',
  );
  const [previewUrls, setPreviewUrls] = useState(draft.previewUrls || {});
  const [tempPreviews, setTempPreviews] = useState({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [portfolioLimits, setPortfolioLimits] = useState(() =>
    getPortfolioLimits(),
  );
  const valuesRef = useRef({});

  const applyDraft = (next = {}, { skipPortfolio = false } = {}) => {
    if (next.name != null) setName(next.name);
    if (next.stageName != null) setStageName(next.stageName);
    if (next.bio != null) setBio(next.bio);
    if (next.category != null) setCategory(next.category);
    if (next.experience != null) setExperience(next.experience);
    if (Array.isArray(next.languages)) setLanguages(next.languages);
    if (Array.isArray(next.events)) setEvents(next.events);
    if (next.profilePhoto) setProfilePhoto(next.profilePhoto);
    if (!skipPortfolio && Array.isArray(next.portfolioPhotos)) {
      setPortfolioPhotos(next.portfolioPhotos);
    }
    if (!skipPortfolio && Array.isArray(next.portfolioVideos)) {
      setPortfolioVideos(next.portfolioVideos);
    }
    if (next.priceType) setPriceType(next.priceType);
    if (next.price != null) setPrice(String(next.price));
    if (next.travelAllowance != null) {
      setTravelAllowance(String(next.travelAllowance));
    }
    if (next.trialSessionFee != null) {
      setTrialSessionFee(String(next.trialSessionFee));
    }
    if (next.teamMemberFee != null) {
      setTeamMemberFee(String(next.teamMemberFee));
    }
    if (next.idImage) setIdImage(next.idImage);
    if (next.selfieImage) setSelfieImage(next.selfieImage);
    if (next.videoInterview) setVideoInterview(next.videoInterview);
    if (next.previewUrls) {
      setPreviewUrls(prev => ({ ...next.previewUrls, ...prev }));
    }
  };

  const persistDraft = async (overrides = {}, stepId) => {
    const form = { ...valuesRef.current, ...overrides };
    const id = stepId || ARTIST_STEP_BY_INDEX[form.step] || 'profile';
    return saveOnboardingProgress(id, artistProgressPayload(form));
  };

  const goToStep = nextStep => {
    setStep(nextStep);
    navigation.setParams({ editStep: nextStep, lockStep: false });
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setHydrating(true);
      const result = await fetchOnboardingStatus();
      if (cancelled) return;

      if (result.success) {
        applyDraft(result.draft || {}, {
          skipPortfolio: Boolean(route.params?.imagedata),
        });
        const apiStep = resumeArtistStepIndex(result.onboarding?.current_step);
        const nextStep = route.params?.lockStep
          ? route.params.editStep ?? apiStep
          : apiStep;
        setStep(nextStep);
        navigation.setParams({
          editStep: nextStep,
          lockStep: Boolean(route.params?.lockStep),
        });
      }
      setHydrating(false);
    })();

    return () => {
      cancelled = true;
    };
    // Restore from the server on mount / Fast Refresh, not from stale route params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPortfolioLimits().then(limits => {
      if (!cancelled) setPortfolioLimits(limits);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rememberPreview = (path, fullUrl) => {
    if (!path || !fullUrl) return;
    setPreviewUrls(prev => ({ ...prev, [path]: fullUrl }));
  };

  const previewOf = (path, docType) => {
    if (path && previewUrls[path]) return previewUrls[path];
    if (docType && tempPreviews[docType]) return tempPreviews[docType];
    if (path && (path.startsWith('file:') || path.startsWith('ph:') || path.startsWith('content:'))) {
      return path;
    }
    return path ? previewUrls[path] || path : tempPreviews[docType] || '';
  };

  useEffect(() => {
    const imageData = route.params?.imagedata;
    const docType = route.params?.doctype;

    if (!imageData?.uri || !docType) {
      return;
    }

    const localUri = imageData.uri;

    navigation.setParams({ imagedata: undefined, doctype: undefined });

    setTempPreviews(prev => ({ ...prev, [docType]: localUri }));
    if (docType === 'photo') setSelfieImage(localUri);
    if (docType === 'profile') setProfilePhoto(localUri);
    if (docType === 'id') setIdImage(localUri);
    if (docType === 'portfolio') {
      const { maxPhotos } = getPortfolioLimits();
      setPortfolioPhotos(prev =>
        prev.length >= maxPhotos ? prev : [...prev, localUri],
      );
    }
    if (docType === 'portfolioVideo') {
      const { maxVideos } = getPortfolioLimits();
      setPortfolioVideos(prev =>
        prev.length >= maxVideos ? prev : [...prev, localUri],
      );
    }
    if (docType === 'videoInterview') setVideoInterview(localUri);

    setUploading(true);
    setError('');

    (async () => {
      try {
        const uploaded = await uploadDocumentApi(localUri, docType);
        const path = uploaded.path;
        rememberPreview(path, uploaded.fullUrl || localUri);

        if (docType === 'photo') setSelfieImage(path);
        else if (docType === 'profile') setProfilePhoto(path);
        else if (docType === 'id') setIdImage(path);
        else if (docType === 'portfolio') {
          setPortfolioPhotos(prev => {
            const next = prev.map(item => (item === localUri ? path : item));
            persistDraft({ portfolioPhotos: next }, 'portfolio');
            return next;
          });
        } else if (docType === 'portfolioVideo') {
          setPortfolioVideos(prev => {
            const next = prev.map(item => (item === localUri ? path : item));
            persistDraft({ portfolioVideos: next }, 'portfolio');
            return next;
          });
        } else if (docType === 'videoInterview') {
          setVideoInterview(path);
        }

        if (docType === 'profile') {
          persistDraft({ profilePhoto: path }, 'profile');
        } else if (docType === 'photo') {
          persistDraft({ selfieImage: path }, 'verify');
        } else if (docType === 'id') {
          persistDraft({ idImage: path }, 'verify');
        } else if (docType === 'videoInterview') {
          persistDraft({ videoInterview: path }, 'verify');
        }
      } catch (err) {
        setError(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    })();
  }, [route.params?.imagedata, route.params?.doctype, navigation]);

  const toggleChip = (value, setter) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value],
    );
    if (error) setError('');
  };

  const removePortfolioPhoto = index => {
    setPortfolioPhotos(prev => {
      const next = prev.filter((_, i) => i !== index);
      persistDraft({ portfolioPhotos: next }, 'portfolio');
      return next;
    });
  };

  const removePortfolioVideo = index => {
    setPortfolioVideos(prev => {
      const next = prev.filter((_, i) => i !== index);
      persistDraft({ portfolioVideos: next }, 'portfolio');
      return next;
    });
  };

  const formState = {
    name,
    stageName,
    bio,
    category,
    experience,
    languages,
    events,
    portfolioPhotos,
    portfolioVideos,
    priceType,
    price,
    travelAllowance,
    trialSessionFee,
    teamMemberFee,
    idImage,
    selfieImage,
    profilePhoto,
    videoInterview,
    step,
  };

  valuesRef.current = formState;

  const canContinue = () => validateArtistStep(step, formState).valid;

  const handleCamera = doctype => {
    openCamera(navigation, {
      frompage: 'ArtistOnboard',
      doctype,
    });
  };

  const handleContinue = async () => {
    setError('');
    const stepResult = validateArtistStep(step, formState);
    if (!stepResult.valid) {
      setError(stepResult.error);
      return;
    }

    if (step < STEPS.length - 1) {
      setLoading(true);
      const saved = await saveOnboardingProgress(
        ARTIST_STEP_BY_INDEX[step],
        artistProgressPayload(formState),
      );
      setLoading(false);
      if (!saved.success) {
        setError(saved.error);
        return;
      }
      goToStep(step + 1);
      return;
    }

    const validation = validateArtistOnboard(formState);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    const result = await onboardArtist({
      ...validation.value,
      profilePhoto: profilePhoto || null,
      videoInterview: videoInterview || null,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onAuthenticated(result.session);
  };

  if (hydrating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.hydrateWrap}>
          <ActivityIndicator color="#6C63FF" size="large" />
          <Text style={styles.hydrateText}>Restoring your progress…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            {STEPS.map((label, index) => (
              <View
                key={label}
                style={[
                  styles.progressBar,
                  index < step && styles.progressBarDone,
                  index === step && styles.progressBarActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.stepMeta}>
            <Text style={styles.stepLabel}>
              Step {step + 1} of {STEPS.length}
            </Text>
            <Text style={styles.stepName}>{STEPS[step]}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <Text style={styles.title}>Basic Profile</Text>
              <Text style={styles.subtitle}>
                Help clients find and trust you
              </Text>
              <UploadTile
                value={previewOf(profilePhoto, 'profile')}
                title="Add profile photo"
                subtitle="JPEG or PNG"
                onPress={() => handleCamera('profile')}
                style={styles.profileUpload}
              />
              {uploading ? (
                <View style={styles.uploadStatus}>
                  <ActivityIndicator color="#6C63FF" />
                  <Text style={styles.uploadStatusText}>Uploading photo…</Text>
                </View>
              ) : null}
              <TextInput
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (error) setError('');
                }}
                placeholder="Full name"
                placeholderTextColor="#D1D5DB"
                style={styles.input}
                editable={!loading}
              />
              <TextInput
                value={stageName}
                onChangeText={setStageName}
                placeholder="Stage name (optional)"
                placeholderTextColor="#D1D5DB"
                style={styles.input}
                editable={!loading}
              />
              <TextInput
                value={bio}
                onChangeText={text => {
                  setBio(text);
                  if (error) setError('');
                }}
                placeholder="Short bio (max 200 chars)"
                placeholderTextColor="#D1D5DB"
                style={[styles.input, styles.textArea]}
                multiline
                maxLength={200}
                editable={!loading}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.title}>Your Category</Text>
              <Text style={styles.subtitle}>What type of artist are you?</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => {
                  const selected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        selected && styles.categoryItemActive,
                      ]}
                      onPress={() => {
                        setCategory(cat.id);
                        if (error) setError('');
                      }}
                      disabled={loading}>
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.categoryName,
                          selected && styles.categoryNameActive,
                        ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>Experience</Text>
              <Text style={styles.subtitle}>
                Tell clients about your expertise
              </Text>
              <ChipGroup
                label="Years of Experience"
                options={EXPERIENCE_OPTIONS}
                selected={experience}
                onSelect={value => {
                  setExperience(value);
                  if (error) setError('');
                }}
                single
              />
              <ChipGroup
                label="Languages"
                options={LANGUAGE_OPTIONS}
                selected={languages}
                onSelect={value => toggleChip(value, setLanguages)}
              />
              <ChipGroup
                label="Event Types"
                options={EVENT_OPTIONS}
                selected={events}
                onSelect={value => toggleChip(value, setEvents)}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.title}>Portfolio</Text>
              <Text style={styles.subtitle}>
                Upload {portfolioLimits.minPhotos} photo
                {portfolioLimits.minPhotos === 1 ? '' : 's'} &amp;{' '}
                {portfolioLimits.minVideos} video
                {portfolioLimits.minVideos === 1 ? '' : 's'} minimum
              </Text>
              <View style={styles.portfolioGrid}>
                {portfolioPhotos.map((path, index) => (
                  <View key={`photo-${path}-${index}`} style={styles.portfolioTile}>
                    <Image
                      source={{ uri: previewOf(path) }}
                      style={styles.portfolioImage}
                    />
                    <TouchableOpacity
                      style={styles.removeBadge}
                      onPress={() => removePortfolioPhoto(index)}>
                      <Text style={styles.removeBadgeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {portfolioPhotos.length < portfolioLimits.maxPhotos && (
                  <TouchableOpacity
                    style={styles.addPortfolioTile}
                    onPress={() => handleCamera('portfolio')}
                    disabled={loading || uploading}>
                    <Text style={styles.addPortfolioPlus}>+</Text>
                    <Text style={styles.addPortfolioLabel}>Photo</Text>
                  </TouchableOpacity>
                )}
                {portfolioVideos.map((path, index) => (
                  <View key={`video-${path}-${index}`} style={styles.portfolioTile}>
                    <Image
                      source={{ uri: previewOf(path) }}
                      style={styles.portfolioImage}
                    />
                    <View style={styles.videoOverlay}>
                      <Text style={styles.videoOverlayText}>▶</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeBadge}
                      onPress={() => removePortfolioVideo(index)}>
                      <Text style={styles.removeBadgeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {portfolioVideos.length < portfolioLimits.maxVideos && (
                  <TouchableOpacity
                    style={styles.addVideoTile}
                    onPress={() => handleCamera('portfolioVideo')}
                    disabled={loading || uploading}>
                    <Text style={styles.addVideoIcon}>🎥</Text>
                    <Text style={styles.addVideoLabel}>Video</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.title}>Your Pricing</Text>
              <Text style={styles.subtitle}>
                Transparent pricing attracts more bookings
              </Text>
              <View style={styles.priceTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.priceTypeButton,
                    priceType === 'fixed' && styles.priceTypeButtonActive,
                  ]}
                  onPress={() => setPriceType('fixed')}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.priceTypeText,
                      priceType === 'fixed' && styles.priceTypeTextActive,
                    ]}>
                    Set Fixed Price
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priceTypeButton,
                    priceType === 'quote' && styles.priceTypeButtonActive,
                  ]}
                  onPress={() => setPriceType('quote')}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.priceTypeText,
                      priceType === 'quote' && styles.priceTypeTextActive,
                    ]}>
                    Request Quote
                  </Text>
                </TouchableOpacity>
              </View>

              {priceType === 'fixed' && (
                <View style={styles.basePriceCard}>
                  <Text style={styles.basePriceLabel}>
                    Base Price (per event)
                  </Text>
                  <View style={styles.basePriceRow}>
                    <Text style={styles.currency}>₹</Text>
                    <TextInput
                      value={price}
                      onChangeText={text => {
                        setPrice(text.replace(/[^0-9]/g, ''));
                        if (error) setError('');
                      }}
                      placeholder="8000"
                      placeholderTextColor="#D1D5DB"
                      keyboardType="number-pad"
                      style={styles.basePriceInput}
                      editable={!loading}
                    />
                  </View>
                  <Text style={styles.basePriceHint}>
                    Clients see this as your starting price
                  </Text>
                </View>
              )}

              <View style={styles.addonList}>
                {[
                  {
                    label: 'Travel allowance',
                    hint: 'Outside 20km',
                    value: travelAllowance,
                    setter: setTravelAllowance,
                  },
                  {
                    label: 'Trial session',
                    hint: 'Per session',
                    value: trialSessionFee,
                    setter: setTrialSessionFee,
                  },
                  {
                    label: 'Team members',
                    hint: 'Additional artists',
                    value: teamMemberFee,
                    setter: setTeamMemberFee,
                  },
                ].map(item => (
                  <View key={item.label} style={styles.addonRow}>
                    <View style={styles.flex}>
                      <Text style={styles.addonLabel}>{item.label}</Text>
                      <Text style={styles.addonHint}>{item.hint}</Text>
                    </View>
                    <TextInput
                      value={item.value}
                      onChangeText={text =>
                        item.setter(text.replace(/[^0-9]/g, ''))
                      }
                      placeholder="₹0"
                      placeholderTextColor="#D1D5DB"
                      keyboardType="number-pad"
                      style={styles.addonInput}
                      editable={!loading}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          {step === 5 && (
            <>
              <Text style={styles.title}>Verification</Text>
              <Text style={styles.subtitle}>
                Get the Verified badge and build trust
              </Text>
              <VerificationItem
                icon="🪪"
                title="Government ID"
                desc="Aadhaar / PAN / Passport"
                tag="required"
                uploaded={idImage.length > 0}
                imageUri={previewOf(idImage, 'id')}
                uploadTitle="Upload Government ID"
                onUpload={() => handleCamera('id')}
              />
              <VerificationItem
                icon="🤳"
                title="Selfie Verification"
                desc="Live selfie to match ID"
                tag="required"
                uploaded={selfieImage.length > 0}
                imageUri={previewOf(selfieImage, 'photo')}
                uploadTitle="Take Selfie"
                onUpload={() => handleCamera('photo')}
              />
              <VerificationItem
                icon="🎥"
                title="Video Interview"
                desc="2-min intro video call"
                tag="optional"
                uploaded={videoInterview.length > 0}
                imageUri={previewOf(videoInterview, 'videoInterview')}
                uploadTitle="Add Intro Video"
                onUpload={() => handleCamera('videoInterview')}
              />
              <View style={styles.perksBox}>
                <Text style={styles.perksTitle}>🎖 Verified Badge Perks</Text>
                {[
                  'Top of search results',
                  '4× higher booking rate',
                  'Blue verified badge',
                  'Priority support',
                ].map(perk => (
                  <Text key={perk} style={styles.perkItem}>
                    ✓ {perk}
                  </Text>
                ))}
              </View>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        {step === 3 ? (
          <View style={styles.tipBox}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              Profiles with 8+ portfolio items get 3× more bookings.
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setError('');
              if (step > 0) {
                goToStep(step - 1);
                return;
              }
              navigation.navigate('OnboardingStatus');
            }}
            disabled={loading}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!canContinue() || loading) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue() || loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.continueButtonText}>
                {step < STEPS.length - 1 ? 'Continue' : 'Submit for Review'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChipGroup({ label, options, selected, onSelect, single = false }) {
  const isSelected = value =>
    single ? selected === value : selected.includes(value);

  return (
    <View style={styles.chipGroup}>
      <Text style={styles.chipLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isSelected(option) && styles.chipActive]}
            onPress={() => onSelect(option)}>
            <Text
              style={[
                styles.chipText,
                isSelected(option) && styles.chipTextActive,
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function VerificationItem({
  icon,
  title,
  desc,
  tag,
  uploaded,
  imageUri,
  uploadTitle,
  onUpload,
}) {
  return (
    <View style={styles.verifyItem}>
      <View style={styles.verifyIconBox}>
        <Text style={styles.verifyIcon}>{icon}</Text>
      </View>
      <View style={styles.verifyContent}>
        <View style={styles.verifyTitleRow}>
          <Text style={styles.verifyTitle}>{title}</Text>
          <View
            style={[
              styles.tag,
              tag === 'required' ? styles.requiredTag : styles.optionalTag,
            ]}>
            <Text
              style={[
                styles.tagText,
                tag === 'required'
                  ? styles.requiredTagText
                  : styles.optionalTagText,
              ]}>
              {tag}
            </Text>
          </View>
        </View>
        <Text style={styles.verifyDesc}>{desc}</Text>
        <UploadTile
          value={imageUri}
          title={uploadTitle}
          subtitle="JPEG or PNG"
          onPress={onUpload}
          width="100%"
          height={110}
          style={styles.verifyUploadTile}
        />
      </View>
      {uploaded ? (
        <View style={styles.uploadDoneBadge}>
          <Text style={styles.uploadDoneBadgeText}>Done</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  flex: {
    flex: 1,
  },
  hydrateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hydrateText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressBarDone: {
    backgroundColor: '#6C63FF',
  },
  progressBarActive: {
    backgroundColor: '#8B5CF6',
  },
  stepMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  stepName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 22,
  },
  profileUpload: {
    marginVertical: 24,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: colors.white,
  },
  categoryItemActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF0D',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#6C63FF',
  },
  chipGroup: {
    marginTop: 20,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF0D',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextActive: {
    color: '#6C63FF',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
  },
  portfolioTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  addPortfolioTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPortfolioPlus: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  addPortfolioLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  addVideoTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C4B5FD',
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVideoIcon: {
    fontSize: 22,
  },
  addVideoLabel: {
    fontSize: 10,
    color: '#8B5CF6',
    marginTop: 4,
    fontWeight: '600',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlayText: {
    color: '#FFF',
    fontSize: 18,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    paddingTop: 40,
    marginBottom: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 16,
    padding: 14,
  },
  tipEmoji: {
    fontSize: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 18,
  },
  priceTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  priceTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  priceTypeButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF0D',
  },
  priceTypeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  priceTypeTextActive: {
    color: '#6C63FF',
  },
  basePriceCard: {
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
  },
  basePriceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  basePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  currency: {
    fontSize: 32,
    fontWeight: '900',
    color: '#D1D5DB',
  },
  basePriceInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '900',
    color: colors.textDark,
    padding: 0,
  },
  basePriceHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  addonList: {
    marginTop: 16,
    gap: 8,
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  addonHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  addonInput: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    padding: 0,
  },
  verifyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginTop: 12,
  },
  verifyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifyIcon: {
    fontSize: 24,
  },
  verifyContent: {
    flex: 1,
  },
  verifyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  requiredTag: {
    backgroundColor: '#FEF2F2',
  },
  optionalTag: {
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  requiredTagText: {
    color: '#EF4444',
  },
  optionalTagText: {
    color: '#6B7280',
  },
  verifyDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  verifyUploadTile: {
    alignSelf: 'stretch',
  },
  uploadDoneBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  uploadDoneBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  perksBox: {
    backgroundColor: '#6C63FF0D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6C63FF1A',
    marginTop: 12,
  },
  perksTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 8,
  },
  perkItem: {
    fontSize: 12,
    color: '#4B5563',
    paddingVertical: 2,
  },
  errorText: {
    marginTop: 16,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  uploadStatusText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  continueButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
