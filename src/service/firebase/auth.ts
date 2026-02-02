import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { firebaseConfig } from './config';

export type FirebaseUser = FirebaseAuthTypes.User;
export type AuthError = FirebaseAuthTypes.NativeFirebaseAuthError;

interface AuthResponse {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}

/**
 * Firebase Authentication Service
 * Singleton pattern for auth operations (Modular API)
 */
class AuthService {
  private static instance: AuthService;
  private auth: FirebaseAuthTypes.Module;

  private constructor() {
    // Ensure Firebase is initialized
    if (!firebaseConfig.isInitialized) {
      console.warn('Firebase not initialized. Auth service may not work properly.');
    }
    this.auth = getAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get the current authenticated user
   */
  public get currentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Check if user is logged in
   */
  public get isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  /**
   * Sign up with email and password
   */
  public async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError),
      };
    }
  }

  /**
   * Sign in with email and password
   */
  public async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError),
      };
    }
  }

  /**
   * Sign out the current user
   */
  public async signOut(): Promise<AuthResponse> {
    try {
      await firebaseSignOut(this.auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError),
      };
    }
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(email: string): Promise<AuthResponse> {
    try {
      await firebaseSendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError),
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  public onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, callback);
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private getErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;
