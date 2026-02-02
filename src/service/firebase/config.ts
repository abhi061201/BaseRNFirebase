import { getApps, getApp } from '@react-native-firebase/app';

/**
 * Firebase Configuration
 * Singleton pattern - Firebase app is automatically initialized
 * by @react-native-firebase using GoogleService-Info.plist (iOS)
 * and google-services.json (Android)
 */

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private _isInitialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  private initialize(): void {
    const apps = getApps();
    if (apps.length > 0) {
      this._isInitialized = true;
      console.log('Firebase initialized successfully');
    } else {
      console.warn('Firebase app not initialized. Check your configuration files.');
    }
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public get app() {
    return getApp();
  }
}

// Export singleton instance
export const firebaseConfig = FirebaseConfig.getInstance();
export default firebaseConfig;
