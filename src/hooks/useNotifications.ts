import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { messagingService, RemoteMessage } from '@/service/firebase';

interface NotificationData {
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

interface UseNotificationsReturn {
  lastNotification: NotificationData | null;
  foregroundNotification: NotificationData | null;
  backgroundNotification: NotificationData | null;
  notificationCount: number;
}

/**
 * Hook to handle all push notifications (foreground, background, quit state)
 * Captures all PN and provides handlers
 * 
 * @example
 * ```typescript
 * const { lastNotification, foregroundNotification } = useNotifications();
 * 
 * useEffect(() => {
 *   if (lastNotification) {
 *     console.log('Received notification:', lastNotification);
 *   }
 * }, [lastNotification]);
 * ```
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);
  const [foregroundNotification, setForegroundNotification] = useState<NotificationData | null>(null);
  const [backgroundNotification, setBackgroundNotification] = useState<NotificationData | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    console.log('📬 Setting up notification handlers...');

    // 1. Handle foreground notifications (app is open)
    const unsubscribeForeground = messagingService.onMessage(handleForegroundNotification);

    // 2. Handle background notification taps (app in background)
    const unsubscribeBackground = messagingService.onNotificationOpenedApp(handleBackgroundNotification);

    // 3. Check if app was opened from notification (quit state)
    checkInitialNotification();

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  /**
   * Handle notification when app is in foreground (open)
   */
  const handleForegroundNotification = useCallback((message: RemoteMessage) => {
    console.log('📱 Foreground notification received:', message);
    
    const notificationData: NotificationData = {
      title: message.notification?.title,
      body: message.notification?.body,
      data: message.data,
    };

    // Update states
    setForegroundNotification(notificationData);
    setLastNotification(notificationData);
    setNotificationCount(prev => prev + 1);

    // Show alert to user (optional - you can customize this)
    if (message.notification) {
      Alert.alert(
        message.notification.title || 'Notification',
        message.notification.body || '',
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'View',
            onPress: () => {
              console.log('👆 User tapped View on foreground notification');
              // You can handle navigation here if needed
              handleNotificationAction(notificationData);
            },
          },
        ]
      );
    }

    // Log all data
    console.log('📦 Notification data:', message.data);
    console.log('🔔 Notification:', message.notification);
  }, []);

  /**
   * Handle notification tap when app is in background
   */
  const handleBackgroundNotification = useCallback((message: RemoteMessage) => {
    console.log('👆 Background notification tapped:', message);

    const notificationData: NotificationData = {
      title: message.notification?.title,
      body: message.notification?.body,
      data: message.data,
    };

    // Update states
    setBackgroundNotification(notificationData);
    setLastNotification(notificationData);
    setNotificationCount(prev => prev + 1);

    // Handle notification action
    handleNotificationAction(notificationData);
  }, []);

  /**
   * Check if app was opened from notification (quit state)
   */
  const checkInitialNotification = async () => {
    const message = await messagingService.getInitialNotification();

    if (message) {
      console.log('🚀 App opened from notification (quit state):', message);

      const notificationData: NotificationData = {
        title: message.notification?.title,
        body: message.notification?.body,
        data: message.data,
      };

      // Update states
      setBackgroundNotification(notificationData);
      setLastNotification(notificationData);
      setNotificationCount(prev => prev + 1);

      // Handle notification action
      handleNotificationAction(notificationData);
    }
  };

  /**
   * Handle notification action (navigation, etc.)
   * You can customize this based on your app's needs
   */
  const handleNotificationAction = (notification: NotificationData) => {
    console.log('🎯 Handling notification action:', notification);

    // Example: Handle navigation based on notification data
    if (notification.data?.screen) {
      console.log('📍 Navigate to:', notification.data.screen);
      // TODO: Implement navigation logic
      // navigation.navigate(notification.data.screen);
    }

    if (notification.data?.url) {
      console.log('🔗 Open URL:', notification.data.url);
      // TODO: Implement deep linking or web view
    }

    // Handle other custom actions
    if (notification.data?.action) {
      console.log('⚡ Execute action:', notification.data.action);
      // TODO: Implement custom action handlers
    }
  };

  return {
    lastNotification,
    foregroundNotification,
    backgroundNotification,
    notificationCount,
  };
};

export default useNotifications;

