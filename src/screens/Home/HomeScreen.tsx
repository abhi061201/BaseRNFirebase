import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '@/core/components/button';
import { Text, SafeScreen } from '@/core/components';
import { Theme, useTheme } from '@/core/theme';
import { authService } from '@/service/firebase';
import type { HomeScreenProps } from '@/navigation/types';
import useHomeScreen from './useHomeScreen';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const { theme, themeMode } = useTheme();

  const user = authService.currentUser;
  
  const { count, increment, decrement, reset } = useHomeScreen();
  
  // Memoize styles - only recreate when theme changes
  const styles = useMemo(() => createStyles(theme), [theme]);

  
  return (
    <SafeScreen
      style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text size="xxl" style={styles.title}>Home</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text size="xxxl" style={styles.title}>Welcome!</Text>
          <Text size="lg" style={styles.email}>
            {user?.email || 'User'}
          </Text>
          <Text size="md" style={styles.subtitle}>
            You are logged in successfully
          </Text>
          <Text size="sm" style={styles.themeInfo}>
            Current Theme: {themeMode === 'primary' ? 'Primary (Blue)' : 'Secondary (Green)'}
          </Text>

          {/* Zustand Counter */}
          <View style={styles.counterContainer}>
            <Text size="xl" style={styles.counterTitle}>Counter Demo</Text>
            <View style={styles.counterDisplay}>
              <Text size="xxxl" style={styles.counterValue}>{count}</Text>
            </View>
            <View style={styles.counterButtons}>
              <TouchableOpacity style={styles.counterButton} onPress={decrement}>
                <Text size="xl" style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.counterButton} onPress={reset}>
                <Text size="md" style={styles.counterButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.counterButton} onPress={increment}>
                <Text size="xl" style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            title="Go to Profile"
            onPress={() => navigation.navigate('Profile')}
            fullWidth
            size="large"
            buttonStyle={styles.button}
          />
          <PrimaryButton
            title="Go to Settings"
            variant="outlined"
            onPress={() => navigation.navigate('Settings')}
            fullWidth
            size="large"
          />
        </View>
      </View>
    </SafeScreen>
  );
};

export default React.memo(HomeScreen);

// Create a function that accepts theme and returns styles
const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  avatarText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  email: {
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  themeInfo: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  counterContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  counterTitle: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  counterDisplay: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  counterValue: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
    fontSize: 48,
  },
  counterButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  counterButton: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    marginBottom: 0,
  },
});
