import {
  getMessaging,
  requestPermission,
  getToken as fcmGetToken,
  deleteToken as fcmDeleteToken,
  onMessage as fcmOnMessage,
  onNotificationOpenedApp as fcmOnNotificationOpenedApp,
  getInitialNotification as fcmGetInitialNotification,
  onTokenRefresh as fcmOnTokenRefresh,
  subscribeToTopic as fcmSubscribeToTopic,
  unsubscribeFromTopic as fcmUnsubscribeFromTopic,
  AuthorizationStatus,
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { firebaseConfig } from './config';

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

interface MessagingResponse {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Firebase Cloud Messaging Service
 * Singleton pattern for push notification operations (Modular API)
 */
class MessagingService {
  private static instance: MessagingService;
  private _fcmToken: string | null = null;
  private messaging: FirebaseMessagingTypes.Module;

  private constructor() {
    if (!firebaseConfig.isInitialized) {
      console.warn('Firebase not initialized. Messaging service may not work properly.');
    }
    this.messaging = getMessaging();
  }

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  /**
   * Get cached FCM token
   */
  public get fcmToken(): string | null {
    return this._fcmToken;
  }

  /**
   * Request notification permissions
   */
  public async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(this.messaging);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;
        return enabled;
      } else {
        // Android 13+ requires POST_NOTIFICATIONS permission
        const androidVersion = typeof Platform.Version === 'string'
          ? parseInt(Platform.Version, 10)
          : Platform.Version;
        if (androidVersion >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  public async getToken(): Promise<MessagingResponse> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Notification permission denied',
        };
      }

      const token = await fcmGetToken(this.messaging);
      this._fcmToken = token;
      return {
        success: true,
        token,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Delete FCM token (useful for logout)
   */
  public async deleteToken(): Promise<MessagingResponse> {
    try {
      await fcmDeleteToken(this.messaging);
      this._fcmToken = null;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Listen for foreground messages
   */
  public onMessage(callback: (message: RemoteMessage) => void): () => void {
    return fcmOnMessage(this.messaging, callback);
  }

  /**
   * Handle notification when app is opened from background
   */
  public onNotificationOpenedApp(callback: (message: RemoteMessage) => void): () => void {
    return fcmOnNotificationOpenedApp(this.messaging, callback);
  }

  /**
   * Get initial notification (app opened from quit state)
   */
  public async getInitialNotification(): Promise<RemoteMessage | null> {
    return fcmGetInitialNotification(this.messaging);
  }

  /**
   * Listen for token refresh
   */
  public onTokenRefresh(callback: (token: string) => void): () => void {
    return fcmOnTokenRefresh(this.messaging, callback);
  }

  /**
   * Subscribe to a topic
   */
  public async subscribeToTopic(topic: string): Promise<MessagingResponse> {
    try {
      await fcmSubscribeToTopic(this.messaging, topic);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Unsubscribe from a topic
   */
  public async unsubscribeFromTopic(topic: string): Promise<MessagingResponse> {
    try {
      await fcmUnsubscribeFromTopic(this.messaging, topic);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}

// Export singleton instance
export const messagingService = MessagingService.getInstance();
export default messagingService;
