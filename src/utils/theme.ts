import { StyleSheet } from 'react-native';

type FontWeight = '400' | '500' | '600';

/* CONSTANTS */
const fontFamily = {
  fontFamilyPrimary: 'ABCFavoritEdu-Medium',
  fontFamilySecondary: 'ABCDiatypeEdu-Medium',
  fontFamilyMonospace: 'ABCDiatypeMonoEdu-Medium',
};

const fontSize = {
  fontSizeTiny: 13,
  fontSizeSmall: 14,
  fontSizeDefault: 15,
  fontSizeBodyLarge: 18,
  fontSizeSubhead: 19.5,
  fontSizeSubheadLarge: 21,
  fontSizeHeaderSmall: 23,
  fontSizeHeader: 26.75,
  fontSizeHeaderBig: 30,
};

const fontWeight = {
  fontWeightRegular: '400' as FontWeight,
  fontWeightMedium: '500' as FontWeight,
  fontWeightSemibold: '600' as FontWeight,
  fontWeightBold: '700' as FontWeight,
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
    button: '#193C2A',
    background: '#131D18',
    message: '#08430D',
  },
  red: {
    sharp: '#F40909',
    soft: '#E80B0B',
    darkest: '#3E110F',
  },
  black: {
    sharp: '#000000',
    soft: '#1D1F1D',
    dark: '#111311',
  },
  white: {
    greenish: '#D8E5DB',
    sharp: '#FFFFFF',
    soft: '#FBFFFB',
    dark: '#F5F5F5',
    darkest: '#DEDEDE',
    darkest2: '#D1D1D1',
  },
  gray: {
    sharp: '#A4A4A4',
    soft: '#939893',
    softest: '#7B7B7B',
    dark: '#414341',
    darkest: '#373737',
    text: '#C9C9C9',
    message: '#2B2B2B',
  },
  otherDark: {
    darkGray: '#6A6A6A',
    lightGray: '#7E837E',
  },
};

const aliases = {
  /* Colors */
  backgroundColor: colors.black.dark,
  backgroundColorSecondary: colors.black.soft,
  backgroundColorGreen: colors.green.background,
  primaryColor: colors.green,
  negativeColor: colors.red,
};

export const vars = {
  ...fontFamily,
  ...fontSize,
  ...fontWeight,
  ...lineHeight,
  ...colors,
  ...aliases,
};

/* THEME */
/* Used as theme values for styled-components */
export const theme = StyleSheet.create({
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
    fontSize: fontSize.fontSizeHeader,
    fontWeight: fontWeight.fontWeightSemibold,
    color: colors.white.sharp,
  },
  textPageTitleSmall: {
    fontFamily: fontFamily.fontFamilyPrimary,
    fontSize: fontSize.fontSizeHeaderSmall,
    fontWeight: fontWeight.fontWeightSemibold,
    color: colors.white.sharp,
  },
  textSectionHeaderLarge: {
    fontFamily: fontFamily.fontFamilyPrimary,
    fontSize: fontSize.fontSizeHeaderSmall,
    fontWeight: fontWeight.fontWeightMedium,
    color: colors.white.darkest,
  },
  textSectionHeader: {
    fontFamily: fontFamily.fontFamilyPrimary,
    fontSize: fontSize.fontSizeSubhead,
    fontWeight: fontWeight.fontWeightMedium,
    color: colors.white.dark,
  },
  textSectionHeaderLight: {
    fontFamily: fontFamily.fontFamilyPrimary,
    fontSize: fontSize.fontSizeSubhead,
    fontWeight: fontWeight.fontWeightRegular,
    color: colors.white.dark,
  },
  textTitle: {
    fontFamily: fontFamily.fontFamilyPrimary,
    fontSize: fontSize.fontSizeHeaderSmall,
    fontWeight: fontWeight.fontWeightSemibold,
    color: colors.white.sharp,
  },
  textSubHeader: {
    fontFamily: fontFamily.fontFamilyPrimary,
    fontSize: fontSize.fontSizeBodyLarge,
    fontWeight: fontWeight.fontWeightSemibold,
    color: colors.white.darkest,
  },
  textLarge: {
    fontFamily: fontFamily.fontFamilySecondary,
    fontSize: fontSize.fontSizeBodyLarge,
    fontWeight: fontWeight.fontWeightRegular,
    color: colors.white.soft,
  },
  textBody: {
    fontFamily: fontFamily.fontFamilySecondary,
    fontSize: fontSize.fontSizeDefault,
    fontWeight: fontWeight.fontWeightRegular,
    color: colors.white.dark,
  },
  textBodyLight: {
    fontFamily: fontFamily.fontFamilySecondary,
    fontSize: fontSize.fontSizeDefault,
    fontWeight: fontWeight.fontWeightRegular,
    color: colors.gray.soft,
  },
  textSmallLight: {
    fontFamily: fontFamily.fontFamilySecondary,
    fontSize: fontSize.fontSizeSmall,
    fontWeight: fontWeight.fontWeightRegular,
    color: colors.gray.softest,
  },
  textSmallMonospace: {
    fontFamily: fontFamily.fontFamilyMonospace,
    fontSize: fontSize.fontSizeTiny,
    fontWeight: fontWeight.fontWeightMedium,
    color: colors.otherDark.darkGray,
  },
});
