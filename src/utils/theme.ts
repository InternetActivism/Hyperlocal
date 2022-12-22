import { StyleSheet } from 'react-native';

type FontWeight = '400' | '500' | '600';

/* CONSTANTS */
/* Used as regular values for spacing, border radius, font size, etc. */
const spacing = {
  space2: 2,
  space4: 4,
  space8: 8,
  space12: 12,
  space16: 16,
  space24: 24,
  space32: 32,
  space48: 48,
  space64: 64,
  space128: 128,
  space256: 256,
};

const borderRadius = {
  borderRadius1: 1,
  borderRadius2: 2,
  borderRadius4: 4,
  borderRadius8: 8,
  borderRadius16: 16,
};

const fontFamily = {
  fontFamilyPrimary: 'ABC Favorit Edu',
  fontFamilySecondary: 'ABC Diatype Edu',
};

const fontSize = {
  fontSizeSmall: 11,
  fontSizeDefault: 14,
  fontSizeSubheadSmall: 16,
  fontSizeSubheadDefault: 18,
  fontSizeSubheadBig: 21,
  fontSizeHeaderDefault: 23,
  fontSizeHeaderBig: 26.75,
};

const fontWeight = {
  fontWeightRegular: '400' as FontWeight,
  fontWeightMedium: '500' as FontWeight,
  fontWeightBold: '600' as FontWeight,
};

const lineHeight = {
  lineHeightSmall: 1.5,
  lineHeightDefault: 1.6,
  lineHeightSubheadDefault: 1.374,
  lineHeightSubheadBig: 1.2,
  lineHeightHeaderDefault: 1,
  lineHeightHeaderBig: 1,
};

const colors = {
  green: {
    sharp: '#09F41D',
    soft: '#04B913',
    dark: '#0D8317',
    darker: '#04570B',
    darkest: '#00310B',
    text: '#1DDE2D',
  },
  red: {
    sharp: '#F40909',
    soft: '#E80B0B',
  },
  black: {
    sharp: '#000000',
    soft: '#1D1F1D',
    dark: '#111311',
  },
  white: {
    sharp: '#FFFFFF',
    soft: '#FBFFFB',
    darkest: '#F5F5F5',
  },
  gray: {
    sharp: '#A4A4A4',
    soft: '#939893',
    softest: '#7B7B7B',
    darkest: '#373737',
    text: '#C9C9C9',
  },
};

const aliases = {
  /* Border Radius */
  borderRadiusDefault: borderRadius.borderRadius8,
  borderRadiusRound: borderRadius.borderRadius16,

  /* Spacing */
  spaceDefault: spacing.space8,

  /* Colors */
  backgroundColor: colors.black.dark,
  backgroundColorSecondary: colors.black.soft,
};

export const constants = {
  ...spacing,
  ...borderRadius,
  ...fontFamily,
  ...fontSize,
  ...fontWeight,
  ...lineHeight,
  ...colors,
  ...aliases,
};

/* THEME */
/* Used as theme values for styled-components */
export default StyleSheet.create({
  /* Shadows */
  shadow1: {
    shadowColor: '#020203',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },
  shadow2: {
    shadowColor: '#020203',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 16,
  },
  shadow3: {
    shadowColor: '#020203',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.48,
    shadowRadius: 32,
    elevation: 32,
  },

  /* Text Styles */
  textPageTitle: {
    fontFamily: fontFamily.fontFamilyPrimary,
    fontSize: fontSize.fontSizeHeaderBig,
    fontWeight: fontWeight.fontWeightBold,
  },
  textHeader: {},
  textSubHeader: {},
  textSubHeaderLight: {},
  textLarge: {},
  textLargeLight: {},
  textBody: {},
  textBodyLight: {},
  textSmall: {},
  textSmallLight: {},
  textTiny: {},
});
