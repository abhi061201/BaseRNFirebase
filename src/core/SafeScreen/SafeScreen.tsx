import React, { ReactNode, useCallback } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  BackHandler,
  StatusBarStyle,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { primaryThemeColors } from '../theme';

interface SafeScreenProps {
  children: ReactNode;
  statusBarColor?: string;
  bottomInsetColor?:string
  gradientColors?: string[];
  onBackPress?: () => boolean;
  style?: ViewStyle;
}

const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  statusBarColor = primaryThemeColors.background,
  bottomInsetColor = primaryThemeColors.background,
  gradientColors,
  onBackPress,
  style,
}) => {

  const insets = useSafeAreaInsets();

  // Handle hardware back button when screen is focused
  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (onBackPress) {
          return onBackPress();
        }
        return false; // Let default behavior handle it
      };

      // Only add back handler on Android
      if (Platform.OS === 'android') {
        const subscription = BackHandler.addEventListener(
          'hardwareBackPress',
          handleBackPress
        );

        return () => subscription.remove();
      }

      return undefined;
    }, [onBackPress])
  );

  // Render with gradient if gradientColors is provided
  if (gradientColors && gradientColors.length > 0) {
    return (
        <LinearGradient
          colors={gradientColors}
          style={[styles.gradient, style]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          {children}
        </LinearGradient>
    );
  }

  // Render with plain background
  return (
    <View style={styles.container} >
      <View style={{ height: insets.top, backgroundColor: statusBarColor }} />
      <View style={[styles.content, style]}>
        {children}
      </View>
      <View style={{ height: insets.bottom, backgroundColor: bottomInsetColor }} />

    </View>
  );
};

export default SafeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});
