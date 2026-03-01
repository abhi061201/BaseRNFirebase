/**
 * App Lifecycle Hook
 * 
 * Handles app state changes for sync and notifications
 */

import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSubscriptionStore } from '@/store';
import { NotificationScheduler } from '@/service/business';
import { logger } from '@/utils/logger';

const MOCK_USER_ID = 'user_demo_123';

export const useAppLifecycle = () => {
  const { subscriptions, syncWithBackend } = useSubscriptionStore();

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        logger.info('App became active - syncing data');
        
        try {
          // Sync data when app comes to foreground
          await syncWithBackend(MOCK_USER_ID);
          
          // Reschedule notifications to ensure they're up to date
          await NotificationScheduler.rescheduleAll(subscriptions);
        } catch (error) {
          logger.error('useAppLifecycle.handleAppStateChange', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [subscriptions, syncWithBackend]);

  // Initial notification setup
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await NotificationScheduler.rescheduleAll(subscriptions);
        logger.info('Initial notification setup complete');
      } catch (error) {
        logger.error('useAppLifecycle.setupNotifications', error);
      }
    };

    setupNotifications();
  }, [subscriptions]);
};

