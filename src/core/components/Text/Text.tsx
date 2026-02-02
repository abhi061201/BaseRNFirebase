import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme';

interface CustomTextProps extends TextProps {
  // Add any custom props you want here
  variant?: 'primary' | 'secondary' | 'default';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
}

const CustomText: React.FC<CustomTextProps> = ({ 
  style, 
  children, 
  variant = 'default',
  size = 'md',
  ...props 
}) => {
  const { theme } = useTheme();

  const textColor = 
    variant === 'primary' ? theme.colors.primary :
    variant === 'secondary' ? theme.colors.secondary :
    theme.colors.text;

  const fontSize = theme.typography.fontSize[size];

  return (
    <RNText 
      style={[
        styles.defaultText, 
        { 
          color: textColor,
          fontSize: fontSize,
          fontFamily: theme.typography.fontFamily.regular,
        },
        style
      ]} 
      {...props}
    >
      {children}
    </RNText>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  defaultText: {
    // Base text styles
  },
});