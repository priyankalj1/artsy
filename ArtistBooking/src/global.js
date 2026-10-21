import {normalizeHeight} from './components/Responsivescreen';

const fonts = {
  // DM Sans — body text, descriptions, UI labels (400–600)
  font_family_fl: 'DMSans-Regular',
  font_family_fr: 'DMSans-Regular',
  font_family_fm: 'DMSans-Medium',
  font_family_fsb: 'DMSans-SemiBold',
  // Manrope — headings, names, prices, bold labels (600–800)
  font_family_fs: 'Manrope-SemiBold',
  font_family_fb: 'Manrope-Bold',
  font_family_feb: 'Manrope-ExtraBold',
};

export default {
  color: {
    white: '#FFFFFF',
    offWhite50: 'rgba(250, 250, 250, 0.5)',
    white25: 'rgba(255, 255, 255, 0.25)',
    white50: 'rgba(255, 255, 255, 0.05)',
    offWhite70: 'rgba(250, 250, 250, 0.7)',
    primary: '#0C121A',
    propertyGrey: '#4B5768',
    mirage: '#151D29',
    seaGreen: '#33B469',
    jasperRed: '#ED3A3A',
    blackPearl: '#1B2128',
    dodgerBlue: '#155DFC',
    lunarShadow: '#6E7985',
    dark: '#1B2128',
    slateGrey: '#26303E',
    gunMetal: '#2E3237',
    property: 'rgba(75, 87, 104, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    transparent: 'transparent',
    calcOne: '#60B7FF',
    calcTwo: '#F6CA94',
    dashPurpule: '#C7CAFF',
    dashLine: '#D4F5FF',
    orange: '#FF964F',
    treeGreen: '#196e24',
    paleyellow: '#FDFD96',
    dullblue: '#30384F',
    textBlue: '#3B82F4',
  },
  font: fonts,
  fontsize: {
    f11: normalizeHeight(11),
    f12: normalizeHeight(12),
    f13: normalizeHeight(13),
    f14: normalizeHeight(13),
    f16: normalizeHeight(16),
    f15: normalizeHeight(15),
    f18: normalizeHeight(18),
    f20: normalizeHeight(18),
    f24: normalizeHeight(24),
    f30: normalizeHeight(30),
  },
};
