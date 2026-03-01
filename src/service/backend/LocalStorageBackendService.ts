/**
 * Local Storage Implementation of IBackendService
 * 
 * Pure local storage backend using AsyncStorage
 * No Firebase required - perfect fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IBackendService } from './IBackendService';
import { Subscription, AppSettings } from '@/types/subscription.types';
import { logger } from '@/utils/logger';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: '@substrack:subscriptions',
  SETTINGS: '@substrack:settings',
} as const;

export class LocalStorageBackendService implements IBackendService {
  // ===== Subscriptions =====

  async getSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (!data) return [];

      const allSubscriptions: Subscription[] = JSON.parse(data);
      
      // Filter by userId and not deleted
      return allSubscriptions
        .filter(sub => sub.userId === userId && !sub.isDeleted)
        .map(sub => this.parseSubscription(sub));
    } catch (error) {
      logger.error('LocalStorageBackendService', 'getSubscriptions error:', error);
      return [];
    }
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (!data) return null;

      const allSubscriptions: Subscription[] = JSON.parse(data);
      const subscription = allSubscriptions.find(sub => sub.id === subscriptionId);
      
      return subscription ? this.parseSubscription(subscription) : null;
    } catch (error) {
      logger.error('LocalStorageBackendService', 'getSubscription error:', error);
      return null;
    }
  }

  async createSubscription(
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Subscription> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const allSubscriptions: Subscription[] = data ? JSON.parse(data) : [];

      const newSubscription: Subscription = {
        ...subscription,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      } as Subscription;

      allSubscriptions.push(newSubscription);
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(allSubscriptions));

      logger.info('LocalStorageBackendService', 'Created subscription:', newSubscription.id);
      return newSubscription;
    } catch (error) {
      logger.error('LocalStorageBackendService', 'createSubscription error:', error);
      throw error;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const allSubscriptions: Subscription[] = data ? JSON.parse(data) : [];

      const index = allSubscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index === -1) {
        throw new Error('Subscription not found');
      }

      allSubscriptions[index] = {
        ...allSubscriptions[index],
        ...updates,
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(allSubscriptions));

      logger.info('LocalStorageBackendService', 'Updated subscription:', subscriptionId);
      return this.parseSubscription(allSubscriptions[index]);
    } catch (error) {
      logger.error('LocalStorageBackendService', 'updateSubscription error:', error);
      throw error;
    }
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const allSubscriptions: Subscription[] = data ? JSON.parse(data) : [];

      const index = allSubscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        allSubscriptions[index].isDeleted = true;
        allSubscriptions[index].updatedAt = new Date();
        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(allSubscriptions));
      }

      logger.info('LocalStorageBackendService', 'Deleted subscription:', subscriptionId);
    } catch (error) {
      logger.error('LocalStorageBackendService', 'deleteSubscription error:', error);
      throw error;
    }
  }

  async hardDeleteSubscription(subscriptionId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const allSubscriptions: Subscription[] = data ? JSON.parse(data) : [];

      const filtered = allSubscriptions.filter(sub => sub.id !== subscriptionId);
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(filtered));

      logger.info('LocalStorageBackendService', 'Hard deleted subscription:', subscriptionId);
    } catch (error) {
      logger.error('LocalStorageBackendService', 'hardDeleteSubscription error:', error);
      throw error;
    }
  }

  // ===== Settings =====

  async getSettings(userId: string): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return null;

      const allSettings: Record<string, AppSettings> = JSON.parse(data);
      const settings = allSettings[userId];

      if (settings) {
        return {
          ...settings,
          updatedAt: new Date(settings.updatedAt),
        };
      }

      return null;
    } catch (error) {
      logger.error('LocalStorageBackendService', 'getSettings error:', error);
      return null;
    }
  }

  async updateSettings(
    userId: string,
    settings: Partial<AppSettings>
  ): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const allSettings: Record<string, AppSettings> = data ? JSON.parse(data) : {};

      const existingSettings = allSettings[userId] || {};
      const updatedSettings: AppSettings = {
        ...existingSettings,
        ...settings,
        userId,
        updatedAt: new Date(),
      } as AppSettings;

      allSettings[userId] = updatedSettings;
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(allSettings));

      logger.info('LocalStorageBackendService', 'Updated settings for user:', userId);
      return updatedSettings;
    } catch (error) {
      logger.error('LocalStorageBackendService', 'updateSettings error:', error);
      throw error;
    }
  }

  // ===== Sync =====

  async syncSubscriptions(
    userId: string,
    localSubscriptions: Subscription[]
  ): Promise<{ synced: Subscription[]; conflicts: Subscription[] }> {
    try {
      // For local storage, just save all subscriptions
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const allSubscriptions: Subscription[] = data ? JSON.parse(data) : [];

      // Remove old subscriptions for this user
      const otherUserSubscriptions = allSubscriptions.filter(sub => sub.userId !== userId);
      
      // Merge with local subscriptions
      const merged = [...otherUserSubscriptions, ...localSubscriptions];
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(merged));

      logger.info('LocalStorageBackendService', 'Synced subscriptions:', localSubscriptions.length);
      return { synced: localSubscriptions, conflicts: [] };
    } catch (error) {
      logger.error('LocalStorageBackendService', 'syncSubscriptions error:', error);
      throw error;
    }
  }

  // No real-time updates for local storage
  subscribeToChanges = undefined;

  // ===== Helper Methods =====

  private parseSubscription(sub: any): Subscription {
    return {
      ...sub,
      startDate: new Date(sub.startDate),
      createdAt: new Date(sub.createdAt),
      updatedAt: new Date(sub.updatedAt),
      lastSyncedAt: sub.lastSyncedAt ? new Date(sub.lastSyncedAt) : undefined,
    };
  }
}

// Export singleton instance
export const localStorageBackendService = new LocalStorageBackendService();

