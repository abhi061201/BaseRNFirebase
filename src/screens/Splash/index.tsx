import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, SafeScreen } from '@/core/components';
import { authService } from '@/service/firebase';
import type { SplashScreenProps } from '@/navigation/types';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenProps['navigation']>();

  useEffect(() => {
    const checkAuthAndNavigate = () => {
      // Check if user is already logged in
      const isLoggedIn = authService.isLoggedIn;

      // Navigate based on auth state
      if (isLoggedIn) {
        navigation.replace('Dashboard');
      } else {
        navigation.replace('Login');
      }
    };

    // Add a small delay for splash branding visibility
    const timer = setTimeout(checkAuthAndNavigate, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeScreen
      statusBarColor="#3B82F6"
      gradientColors={['#3B82F6', '#2563EB', '#1D4ED8']}
      style={styles.container}>
      <View style={styles.content}>
        <Text size="xxxl" style={styles.title}>FCMRN</Text>
      </View>
    </SafeScreen>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3B82F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
});
