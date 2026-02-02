import React from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import InputField from '@/core/components/inputField';
import { PrimaryButton } from '@/core/components/button';
import { Text, SafeScreen } from '@/core/components';
import { useSignup } from './useSignup';
const SignupScreen: React.FC = () => {
  const {
    email,
    password,
    confirmPassword,
    errors,
    loading,
    passwordStrength,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSignup,
    navigateToLogin,
  } = useSignup();

  return (
    <SafeScreen
      statusBarColor="#F9FAFB"
      barStyle="dark-content"
      style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text size="xxl" style={styles.title}>Create Account</Text>
            <Text size="md" style={styles.subtitle}>Sign up to get started</Text>
          </View>

        <View style={styles.form}>
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <InputField
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
          />

          <InputField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <View style={styles.passwordHints}>
            <Text style={styles.hintText}>Password must contain:</Text>
            <Text style={[styles.hintItem, passwordStrength.hasMinLength && styles.hintValid]}>
              • At least 6 characters
            </Text>
            <Text style={[styles.hintItem, passwordStrength.hasUppercase && styles.hintValid]}>
              • One uppercase letter
            </Text>
            <Text style={[styles.hintItem, passwordStrength.hasNumber && styles.hintValid]}>
              • One number
            </Text>
          </View>

          <PrimaryButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            fullWidth
            size="large"
            buttonStyle={styles.signupButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
  },
  form: {
    flex: 1,
  },
  passwordHints: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  hintItem: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
    marginTop: 2,
  },
  hintValid: {
    color: '#10B981',
  },
  signupButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
