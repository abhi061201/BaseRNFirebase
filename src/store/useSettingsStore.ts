/**
 * Settings Store (Zustand)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, Currency } from '@/types/subscription.types';
import { getBackendService } from '@/service/backend';
import { logger } from '@/utils/logger';

interface SettingsState extends Partial<AppSettings> {
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (userId: string, settings: Partial<AppSettings>) => Promise<void>;
  setCurrency: (currency: Currency) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setDefaultReminderDays: (days: number) => void;
}

const DEFAULT_SETTINGS: Omit<AppSettings, 'userId'> = {
  currency: 'INR',
  notificationsEnabled: true,
  theme: 'system',
  defaultReminderDays: 3,
  updatedAt: new Date(),
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial State
      ...DEFAULT_SETTINGS,
      isLoading: false,
      error: null,

      // ===== Actions =====

      /**
       * Fetch settings from backend
       */
      fetchSettings: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const backend = await getBackendService();
          const settings = await backend.getSettings(userId);
          
          if (settings) {
            set({
              ...settings,
              isLoading: false,
            });
          } else {
            // Create default settings
            const defaultSettings: AppSettings = {
              ...DEFAULT_SETTINGS,
              userId,
            };
            await backend.updateSettings(userId, defaultSettings);
            set({
              ...defaultSettings,
              isLoading: false,
            });
          }
        } catch (error: any) {
          logger.error('useSettingsStore.fetchSettings', error);
          set({ error: error.message, isLoading: false });
        }
      },

      /**
       * Update settings
       */
      updateSettings: async (userId: string, settings: Partial<AppSettings>) => {
        set({ isLoading: true, error: null });
        try {
          const backend = await getBackendService();
          const updated = await backend.updateSettings(userId, settings);
          set({
            ...updated,
            isLoading: false,
          });

          logger.info('Settings updated', settings);
        } catch (error: any) {
          logger.error('useSettingsStore.updateSettings', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      /**
       * Quick setters for common settings
       */
      setCurrency: (currency: Currency) => {
        set({ currency });
        const userId = get().userId;
        if (userId) {
          get().updateSettings(userId, { currency });
        }
      },

      setNotificationsEnabled: (enabled: boolean) => {
        set({ notificationsEnabled: enabled });
        const userId = get().userId;
        if (userId) {
          get().updateSettings(userId, { notificationsEnabled: enabled });
        }
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        const userId = get().userId;
        if (userId) {
          get().updateSettings(userId, { theme });
        }
      },

      setDefaultReminderDays: (days: number) => {
        set({ defaultReminderDays: days });
        const userId = get().userId;
        if (userId) {
          get().updateSettings(userId, { defaultReminderDays: days });
        }
      },
    }),
    {
      name: 'substrack-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist all settings except loading states
      partialize: (state) => ({
        userId: state.userId,
        currency: state.currency,
        notificationsEnabled: state.notificationsEnabled,
        theme: state.theme,
        defaultReminderDays: state.defaultReminderDays,
        updatedAt: state.updatedAt,
      }),
    }
  )
);

