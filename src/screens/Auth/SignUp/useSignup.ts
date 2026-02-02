import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@/service/firebase';
import type { SignupScreenProps } from '@/navigation/types';

interface SignupErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

interface UseSignupReturn {
  // State
  email: string;
  password: string;
  confirmPassword: string;
  errors: SignupErrors;
  loading: boolean;
  passwordStrength: PasswordStrength;

  // Actions
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  handleSignup: () => Promise<void>;
  navigateToLogin: () => void;
}

export const useSignup = (): UseSignupReturn => {
  const navigation = useNavigation<SignupScreenProps['navigation']>();

  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPasswordState] = useState('');
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo<PasswordStrength>(() => ({
    hasMinLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }), [password]);

  const validateEmail = useCallback((value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: SignupErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordStrength.hasMinLength) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!passwordStrength.hasUppercase) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!passwordStrength.hasNumber) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, passwordStrength, validateEmail]);

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

  const setConfirmPassword = useCallback((value: string) => {
    setConfirmPasswordState(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  }, [errors.confirmPassword]);

  const handleSignup = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    const response = await authService.signUp(email.trim(), password);
    setLoading(false);

    if (response.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      Alert.alert('Signup Failed', response.error || 'Please try again.');
    }
  }, [email, password, navigation, validateForm]);

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return {
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
  };
};

export default useSignup;
