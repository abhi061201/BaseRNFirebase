/**
 * Notification Scheduler
 * 
 * Handles scheduling local notifications for subscription reminders
 */

import { Subscription } from '@/types/subscription.types';
import { SubscriptionCalculator } from './SubscriptionCalculator';
import { logger } from '@/utils/logger';

// Note: You'll need to install @notifee/react-native or react-native-push-notification
// For now, this is a placeholder that shows the logic

export interface ScheduledNotification {
  id: string;
  subscriptionId: string;
  scheduledDate: Date;
  type: 'billing_reminder' | 'cancellation_alert';
  title: string;
  body: string;
}

export class NotificationScheduler {
  private static scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  /**
   * Schedule all notifications for a subscription
   */
  static async scheduleForSubscription(subscription: Subscription): Promise<void> {
    try {
      // Cancel existing notifications for this subscription
      await this.cancelForSubscription(subscription.id);

      if (!subscription.reminderEnabled) {
        return;
      }

      // Schedule regular billing reminder
      await this.scheduleBillingReminder(subscription);

      // Schedule cancellation alert for one-time subscriptions
      if (subscription.isOneTime && subscription.cycleLimit) {
        await this.scheduleCancellationAlert(subscription);
      }

      logger.info('NotificationScheduler.scheduleForSubscription', {
        subscriptionId: subscription.id,
        serviceName: subscription.serviceName,
      });
    } catch (error) {
      logger.error('NotificationScheduler.scheduleForSubscription', error);
    }
  }

  /**
   * Schedule billing reminder (X days before billing date)
   */
  private static async scheduleBillingReminder(subscription: Subscription): Promise<void> {
    const reminderDate = SubscriptionCalculator.getReminderDate(subscription);
    if (!reminderDate) return;

    const notification: ScheduledNotification = {
      id: `billing_${subscription.id}`,
      subscriptionId: subscription.id,
      scheduledDate: reminderDate,
      type: 'billing_reminder',
      title: `${subscription.serviceName} - Upcoming Payment`,
      body: `${SubscriptionCalculator.formatCurrency(subscription.amount, subscription.currency)} will be charged in ${subscription.reminderDaysBefore} days`,
    };

    // In production, use actual notification library
    // await notifee.createTriggerNotification(notification, trigger);
    
    this.scheduledNotifications.set(notification.id, notification);
    logger.info('Scheduled billing reminder', { notification });
  }

  /**
   * Schedule cancellation alert for one-time subscriptions
   * Alert at end of (cycleLimit - 1), so user can cancel before final billing
   */
  private static async scheduleCancellationAlert(subscription: Subscription): Promise<void> {
    const cancellationDate = SubscriptionCalculator.getCancellationReminderDate(subscription);
    if (!cancellationDate) return;

    const notification: ScheduledNotification = {
      id: `cancel_${subscription.id}`,
      subscriptionId: subscription.id,
      scheduledDate: cancellationDate,
      type: 'cancellation_alert',
      title: `${subscription.serviceName} - Subscription Ending Soon`,
      body: `Your ${subscription.cycleLimit}-month subscription has 1 cycle left. Cancel now to avoid next billing!`,
    };

    // In production, use actual notification library
    // await notifee.createTriggerNotification(notification, trigger);
    
    this.scheduledNotifications.set(notification.id, notification);
    logger.info('Scheduled cancellation alert', { notification });
  }

  /**
   * Cancel all notifications for a subscription
   */
  static async cancelForSubscription(subscriptionId: string): Promise<void> {
    try {
      const billingId = `billing_${subscriptionId}`;
      const cancelId = `cancel_${subscriptionId}`;

      // In production: await notifee.cancelNotification(billingId);
      // In production: await notifee.cancelNotification(cancelId);

      this.scheduledNotifications.delete(billingId);
      this.scheduledNotifications.delete(cancelId);

      logger.info('Cancelled notifications', { subscriptionId });
    } catch (error) {
      logger.error('NotificationScheduler.cancelForSubscription', error);
    }
  }

  /**
   * Reschedule notifications for all subscriptions
   */
  static async rescheduleAll(subscriptions: Subscription[]): Promise<void> {
    try {
      // Cancel all existing
      await this.cancelAll();

      // Schedule new
      for (const subscription of subscriptions) {
        if (SubscriptionCalculator.isActive(subscription)) {
          await this.scheduleForSubscription(subscription);
        }
      }

      logger.info('Rescheduled all notifications', { count: subscriptions.length });
    } catch (error) {
      logger.error('NotificationScheduler.rescheduleAll', error);
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAll(): Promise<void> {
    try {
      // In production: await notifee.cancelAllNotifications();
      this.scheduledNotifications.clear();
      logger.info('Cancelled all notifications');
    } catch (error) {
      logger.error('NotificationScheduler.cancelAll', error);
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  static getScheduled(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }
}

