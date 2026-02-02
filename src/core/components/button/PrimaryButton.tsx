import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@/core/theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  variant = 'filled',
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  buttonStyle,
  textStyle,
  disabled,
  ...touchableProps
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.button, styles[`${size}Button`]];

    if (variant === 'filled') {
      baseStyles.push(styles.filledButton);
      if (isDisabled) baseStyles.push(styles.filledButtonDisabled);
    } else if (variant === 'outlined') {
      baseStyles.push(styles.outlinedButton);
      if (isDisabled) baseStyles.push(styles.outlinedButtonDisabled);
    } else if (variant === 'ghost') {
      baseStyles.push(styles.ghostButton);
      if (isDisabled) baseStyles.push(styles.ghostButtonDisabled);
    }

    if (fullWidth) baseStyles.push(styles.fullWidth);

    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyles: TextStyle[] = [styles.text, styles[`${size}Text`]];

    if (variant === 'filled') {
      baseStyles.push(styles.filledText);
      if (isDisabled) baseStyles.push(styles.filledTextDisabled);
    } else if (variant === 'outlined') {
      baseStyles.push(styles.outlinedText);
      if (isDisabled) baseStyles.push(styles.outlinedTextDisabled);
    } else if (variant === 'ghost') {
      baseStyles.push(styles.ghostText);
      if (isDisabled) baseStyles.push(styles.ghostTextDisabled);
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), buttonStyle]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...touchableProps}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? theme.colors.onPrimary : theme.colors.primary}
        />
      ) : (
        <>
          {leftIcon && leftIcon}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;

// Note: Styles are now created dynamically using theme
// For static styles that don't change with theme:
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  // Size variants
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  // Filled variant
  filledButton: {
    backgroundColor: '#3B82F6',
  },
  filledButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  filledText: {
    color: '#FFFFFF',
  },
  filledTextDisabled: {
    color: '#E0E7FF',
  },
  // Outlined variant
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  outlinedButtonDisabled: {
    borderColor: '#93C5FD',
  },
  outlinedText: {
    color: '#3B82F6',
  },
  outlinedTextDisabled: {
    color: '#93C5FD',
  },
  // Ghost variant
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostButtonDisabled: {
    opacity: 0.5,
  },
  ghostText: {
    color: '#3B82F6',
  },
  ghostTextDisabled: {
    color: '#93C5FD',
  },
  // Text sizes
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
