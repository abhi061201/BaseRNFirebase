import { Theme } from './types';
import { primaryThemeColors, secondaryThemeColors } from './colors';

const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    fontFamily: {
      regular: 'BarlowCondensed-Regular',
      medium: 'BarlowCondensed-Medium',
      bold: 'BarlowCondensed-Bold',
      light: 'BarlowCondensed-Light',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
      xxxl: 48,
    },
  },
};

export const primaryTheme: Theme = {
  colors: primaryThemeColors,
  ...commonTheme,
};

export const secondaryTheme: Theme = {
  colors: secondaryThemeColors,
  ...commonTheme,
};

export const themes = {
  primary: primaryTheme,
  secondary: secondaryTheme,
};

