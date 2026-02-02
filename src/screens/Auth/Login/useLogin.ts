import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@/service/firebase';
import type { LoginScreenProps } from '@/navigation/types';

interface LoginErrors {
  email?: string;
  password?: string;
}

interface UseLoginReturn {
  // State
  email: string;
  password: string;
  errors: LoginErrors;
  loading: boolean;

  // Actions
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  handleLogin: () => Promise<void>;
  handleForgotPassword: () => Promise<void>;
  navigateToSignup: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const navigation = useNavigation<LoginScreenProps['navigation']>();

  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = useCallback((value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, validateEmail]);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }, [errors.email]);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  }, [errors.password]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    const response = await authService.signIn(email.trim(), password);
    setLoading(false);

    if (response.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      Alert.alert('Login Failed', response.error || 'Please try again.');
    }
  }, [email, password, navigation, validateForm]);

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Enter your email to reset password' }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email' }));
      return;
    }

    setLoading(true);
    const response = await authService.sendPasswordResetEmail(email.trim());
    setLoading(false);

    if (response.success) {
      Alert.alert('Email Sent', 'Check your inbox for password reset instructions.');
    } else {
      Alert.alert('Error', response.error || 'Failed to send reset email.');
    }
  }, [email, validateEmail]);

  const navigateToSignup = useCallback(() => {
    navigation.navigate('Signup');
  }, [navigation]);

  return {
    email,
    password,
    errors,
    loading,
    setEmail,
    setPassword,
    handleLogin,
    handleForgotPassword,
    navigateToSignup,
  };
};

export default useLogin;
