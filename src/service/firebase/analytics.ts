import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  logScreenView as firebaseLogScreenView,
  setUserId as firebaseSetUserId,
  setUserProperty as firebaseSetUserProperty,
  logLogin as firebaseLogLogin,
  logSignUp as firebaseLogSignUp,
  setAnalyticsCollectionEnabled as firebaseSetAnalyticsCollectionEnabled,
  resetAnalyticsData as firebaseResetAnalyticsData,
  FirebaseAnalyticsTypes,
} from '@react-native-firebase/analytics';
import { firebaseConfig } from './config';

/**
 * Firebase Analytics Service
 * Singleton pattern for analytics operations (Modular API)
 */
class AnalyticsService {
  private static instance: AnalyticsService;
  private analytics: FirebaseAnalyticsTypes.Module;

  private constructor() {
    if (!firebaseConfig.isInitialized) {
      console.warn('Firebase not initialized. Analytics service may not work properly.');
    }
    this.analytics = getAnalytics();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Log a custom event
   */
  public async logEvent(eventName: string, params?: Record<string, unknown>): Promise<void> {
    try {
      await firebaseLogEvent(this.analytics, eventName, params);
    } catch (error) {
      console.error('Analytics logEvent error:', error);
    }
  }

  /**
   * Log screen view
   */
  public async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    try {
      await firebaseLogScreenView(this.analytics, {
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.error('Analytics logScreenView error:', error);
    }
  }

  /**
   * Set user ID for analytics
   */
  public async setUserId(userId: string | null): Promise<void> {
    try {
      await firebaseSetUserId(this.analytics, userId);
    } catch (error) {
      console.error('Analytics setUserId error:', error);
    }
  }

  /**
   * Set user property
   */
  public async setUserProperty(name: string, value: string | null): Promise<void> {
    try {
      await firebaseSetUserProperty(this.analytics, name, value);
    } catch (error) {
      console.error('Analytics setUserProperty error:', error);
    }
  }

  /**
   * Log login event
   */
  public async logLogin(method: string): Promise<void> {
    try {
      await firebaseLogLogin(this.analytics, { method });
    } catch (error) {
      console.error('Analytics logLogin error:', error);
    }
  }

  /**
   * Log sign up event
   */
  public async logSignUp(method: string): Promise<void> {
    try {
      await firebaseLogSignUp(this.analytics, { method });
    } catch (error) {
      console.error('Analytics logSignUp error:', error);
    }
  }

  /**
   * Enable/disable analytics collection
   */
  public async setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      await firebaseSetAnalyticsCollectionEnabled(this.analytics, enabled);
    } catch (error) {
      console.error('Analytics setAnalyticsCollectionEnabled error:', error);
    }
  }

  /**
   * Reset analytics data
   */
  public async resetAnalyticsData(): Promise<void> {
    try {
      await firebaseResetAnalyticsData(this.analytics);
    } catch (error) {
      console.error('Analytics resetAnalyticsData error:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
export default analyticsService;
