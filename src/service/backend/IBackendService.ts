/**
 * Backend Service Interface
 * 
 * This abstraction allows swapping backends (Firebase, Supabase, REST API, etc.)
 * without changing business logic.
 */

import { Subscription, AppSettings } from '@/types/subscription.types';

export interface IBackendService {
  // ===== Subscriptions =====
  
  /**
   * Fetch all subscriptions for a user
   */
  getSubscriptions(userId: string): Promise<Subscription[]>;
  
  /**
   * Fetch a single subscription by ID
   */
  getSubscription(subscriptionId: string): Promise<Subscription | null>;
  
  /**
   * Create a new subscription
   */
  createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription>;
  
  /**
   * Update an existing subscription
   */
  updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription>;
  
  /**
   * Delete a subscription (soft delete)
   */
  deleteSubscription(subscriptionId: string): Promise<void>;
  
  /**
   * Permanently delete a subscription
   */
  hardDeleteSubscription(subscriptionId: string): Promise<void>;
  
  // ===== Settings =====
  
  /**
   * Get user settings
   */
  getSettings(userId: string): Promise<AppSettings | null>;
  
  /**
   * Update user settings
   */
  updateSettings(userId: string, settings: Partial<AppSettings>): Promise<AppSettings>;
  
  // ===== Sync =====
  
  /**
   * Sync local changes to backend
   * Returns conflicts if any (for conflict resolution)
   */
  syncSubscriptions(userId: string, localSubscriptions: Subscription[]): Promise<{
    synced: Subscription[];
    conflicts: Subscription[];
  }>;
  
  /**
   * Listen to real-time updates (optional for backends that support it)
   */
  subscribeToChanges?(userId: string, callback: (subscriptions: Subscription[]) => void): () => void;
}

