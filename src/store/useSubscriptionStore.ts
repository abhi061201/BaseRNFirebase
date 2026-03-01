/**
 * Subscription Store (Zustand)
 * 
 * Offline-first architecture with sync capabilities
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription, SubscriptionSummary } from '@/types/subscription.types';
import { getBackendService } from '@/service/backend';
import { SubscriptionCalculator } from '@/service/business';
import { NotificationScheduler } from '@/service/business';
import { logger } from '@/utils/logger';

interface SubscriptionState {
  // Data
  subscriptions: Subscription[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;

  // Computed (cached)
  summary: SubscriptionSummary | null;

  // Actions
  fetchSubscriptions: (userId: string) => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  syncWithBackend: (userId: string) => Promise<void>;
  calculateSummary: () => void;
  
  // Realtime
  subscribeToRealtime: (userId: string) => () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial State
      subscriptions: [],
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,
      summary: null,

      // ===== Actions =====

      /**
       * Fetch subscriptions from backend
       * Auto-detects and uses Firebase or LocalStorage
       */
      fetchSubscriptions: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const backend = await getBackendService();
          const subscriptions = await backend.getSubscriptions(userId);
          set({ 
            subscriptions, 
            isLoading: false,
            lastSyncedAt: new Date(),
          });
          get().calculateSummary();

          // Schedule notifications
          await NotificationScheduler.rescheduleAll(subscriptions);
        } catch (error: any) {
          logger.error('useSubscriptionStore.fetchSubscriptions', error);
          set({ error: error.message, isLoading: false });
        }
      },

      /**
       * Add a new subscription
       */
      addSubscription: async (subscription) => {
        set({ isLoading: true, error: null });
        try {
          const backend = await getBackendService();
          const newSubscription = await backend.createSubscription(subscription);
          
          set((state) => ({
            subscriptions: [...state.subscriptions, newSubscription],
            isLoading: false,
          }));
          
          get().calculateSummary();
          await NotificationScheduler.scheduleForSubscription(newSubscription);

          logger.info('Subscription added', { id: newSubscription.id });
        } catch (error: any) {
          logger.error('useSubscriptionStore.addSubscription', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Update an existing subscription
       */
      updateSubscription: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const backend = await getBackendService();
          const updated = await backend.updateSubscription(id, updates);
          
          set((state) => ({
            subscriptions: state.subscriptions.map((sub) =>
              sub.id === id ? updated : sub
            ),
            isLoading: false,
          }));

          get().calculateSummary();
          await NotificationScheduler.scheduleForSubscription(updated);

          logger.info('Subscription updated', { id });
        } catch (error: any) {
          logger.error('useSubscriptionStore.updateSubscription', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Delete a subscription (soft delete)
       */
      deleteSubscription: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const backend = await getBackendService();
          await backend.deleteSubscription(id);
          
          set((state) => ({
            subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
            isLoading: false,
          }));

          get().calculateSummary();
          await NotificationScheduler.cancelForSubscription(id);

          logger.info('Subscription deleted', { id });
        } catch (error: any) {
          logger.error('useSubscriptionStore.deleteSubscription', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Sync local data with backend (offline-first strategy)
       */
      syncWithBackend: async (userId: string) => {
        set({ isSyncing: true, error: null });
        try {
          const backend = await getBackendService();
          const localSubscriptions = get().subscriptions;
          const { synced } = await backend.syncSubscriptions(userId, localSubscriptions);

          set({
            subscriptions: synced,
            isSyncing: false,
            lastSyncedAt: new Date(),
          });

          get().calculateSummary();
          await NotificationScheduler.rescheduleAll(synced);

          logger.info('Sync completed', { count: synced.length });
        } catch (error: any) {
          logger.error('useSubscriptionStore.syncWithBackend', error);
          set({ error: error.message, isSyncing: false });
        }
      },

      /**
       * Calculate summary metrics
       */
      calculateSummary: () => {
        const { subscriptions } = get();
        const activeSubscriptions = subscriptions.filter((sub) =>
          SubscriptionCalculator.isActive(sub)
        );

        const summary: SubscriptionSummary = {
          totalMonthlySpend: SubscriptionCalculator.calculateTotalMonthlySpend(activeSubscriptions),
          totalActiveSubscriptions: activeSubscriptions.length,
          upcomingInNext7Days: SubscriptionCalculator.getUpcomingSubscriptions(activeSubscriptions, 7),
          upcomingThisMonth: SubscriptionCalculator.getUpcomingSubscriptions(activeSubscriptions, 30),
        };

        set({ summary });
      },

      /**
       * Subscribe to real-time updates from backend
       */
      subscribeToRealtime: (userId: string) => {
        // Async wrapper to get backend service
        let unsubscribe: (() => void) | null = null;
        
        getBackendService().then(backend => {
          if (!backend.subscribeToChanges) {
            logger.warn('Backend does not support real-time updates (using LocalStorage)');
            return;
          }

          unsubscribe = backend.subscribeToChanges(userId, (subscriptions) => {
            set({ subscriptions, lastSyncedAt: new Date() });
            get().calculateSummary();
          });
        });

        return () => {
          if (unsubscribe) unsubscribe();
        };
      },
    }),
    {
      name: 'substrack-subscriptions',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist subscriptions and summary, not loading states
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        lastSyncedAt: state.lastSyncedAt,
        summary: state.summary,
      }),
    }
  )
);

