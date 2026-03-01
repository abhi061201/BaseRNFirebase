/**
 * Subscription Calculator
 * 
 * Handles all business logic related to subscription calculations:
 * - Next billing dates
 * - Monthly spend conversion
 * - Cycle calculations
 * - Reminder dates
 */

import { Subscription, BillingFrequency, Currency } from '@/types/subscription.types';

export class SubscriptionCalculator {
  /**
   * Calculate the next billing date for a subscription
   */
  static getNextBillingDate(subscription: Subscription): Date {
    const today = new Date();
    const startDate = new Date(subscription.startDate);
    const billingDay = subscription.billingDate;

    // If subscription has ended (one-time with cycle limit)
    if (subscription.isOneTime && subscription.cycleLimit) {
      const endDate = this.getSubscriptionEndDate(subscription);
      if (today > endDate) {
        return endDate; // Already ended
      }
    }

    // Calculate next occurrence based on frequency
    let nextDate = new Date(today.getFullYear(), today.getMonth(), billingDay);

    // If billing day is in the past this month, move to next cycle
    if (nextDate <= today) {
      nextDate = this.addBillingCycle(nextDate, subscription.frequency, subscription.customFrequencyDays);
    }

    return nextDate;
  }

  /**
   * Calculate when a one-time subscription will end
   * For 6-month subscription, reminder should be at end of 5th month
   */
  static getSubscriptionEndDate(subscription: Subscription): Date {
    if (!subscription.isOneTime || !subscription.cycleLimit) {
      throw new Error('Not a one-time subscription');
    }

    const startDate = new Date(subscription.startDate);
    let endDate = new Date(startDate);

    // Add cycles based on frequency
    for (let i = 0; i < subscription.cycleLimit; i++) {
      endDate = this.addBillingCycle(endDate, subscription.frequency, subscription.customFrequencyDays);
    }

    return endDate;
  }

  /**
   * Calculate the "cancellation reminder" date for one-time subscriptions
   * This is (totalCycles - 1) from start, so user can cancel before final billing
   */
  static getCancellationReminderDate(subscription: Subscription): Date | null {
    if (!subscription.isOneTime || !subscription.cycleLimit || subscription.cycleLimit <= 1) {
      return null;
    }

    const startDate = new Date(subscription.startDate);
    let reminderDate = new Date(startDate);

    // Add (cycleLimit - 1) cycles to get reminder at end of second-to-last cycle
    for (let i = 0; i < subscription.cycleLimit - 1; i++) {
      reminderDate = this.addBillingCycle(reminderDate, subscription.frequency, subscription.customFrequencyDays);
    }

    return reminderDate;
  }

  /**
   * Get the reminder date (X days before next billing)
   */
  static getReminderDate(subscription: Subscription): Date | null {
    if (!subscription.reminderEnabled) {
      return null;
    }

    const nextBilling = this.getNextBillingDate(subscription);
    const reminderDate = new Date(nextBilling);
    reminderDate.setDate(reminderDate.getDate() - subscription.reminderDaysBefore);

    return reminderDate;
  }

  /**
   * Calculate days until next billing
   */
  static getDaysUntilBilling(subscription: Subscription): number {
    const today = new Date();
    const nextBilling = this.getNextBillingDate(subscription);
    const diffTime = nextBilling.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Convert any frequency to monthly equivalent for "Total Monthly Spend" calculation
   */
  static getMonthlyEquivalent(subscription: Subscription): number {
    const { amount, frequency, customFrequencyDays } = subscription;

    switch (frequency) {
      case 'monthly':
        return amount;
      case 'quarterly':
        return amount / 3;
      case 'half-yearly':
        return amount / 6;
      case 'yearly':
        return amount / 12;
      case 'custom':
        if (customFrequencyDays) {
          // Convert custom days to monthly (assume 30 days/month)
          return (amount * 30) / customFrequencyDays;
        }
        return amount;
      default:
        return amount;
    }
  }

  /**
   * Calculate total monthly spend across all subscriptions
   */
  static calculateTotalMonthlySpend(subscriptions: Subscription[], targetCurrency: Currency = 'USD'): number {
    return subscriptions
      .filter(sub => !sub.isDeleted)
      .reduce((total, sub) => {
        const monthlyAmount = this.getMonthlyEquivalent(sub);
        const convertedAmount = this.convertCurrency(monthlyAmount, sub.currency, targetCurrency);
        return total + monthlyAmount;
      }, 0);
  }

  /**
   * Get subscriptions with billing in the next N days
   */
  static getUpcomingSubscriptions(subscriptions: Subscription[], days: number): Subscription[] {
    return subscriptions
      .filter(sub => {
        if (sub.isDeleted) return false;
        const daysUntil = this.getDaysUntilBilling(sub);
        return daysUntil >= 0 && daysUntil <= days;
      })
      .sort((a, b) => this.getDaysUntilBilling(a) - this.getDaysUntilBilling(b));
  }

  /**
   * Check if subscription is active (not ended for one-time subscriptions)
   */
  static isActive(subscription: Subscription): boolean {
    if (subscription.isDeleted) return false;
    
    if (subscription.isOneTime && subscription.cycleLimit) {
      const endDate = this.getSubscriptionEndDate(subscription);
      return new Date() < endDate;
    }

    return true;
  }

  // ===== Helper Methods =====

  /**
   * Add one billing cycle to a date
   */
  private static addBillingCycle(date: Date, frequency: BillingFrequency, customDays?: number): Date {
    const newDate = new Date(date);

    switch (frequency) {
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case 'half-yearly':
        newDate.setMonth(newDate.getMonth() + 6);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      case 'custom':
        if (customDays) {
          newDate.setDate(newDate.getDate() + customDays);
        }
        break;
    }

    return newDate;
  }

  /**
   * Simple currency conversion (placeholder - in production, use real exchange rates)
   */
  private static convertCurrency(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;

    // Simplified exchange rates (hardcoded for now)
    // In production, fetch from API like exchangerate-api.com
    const rates: Record<Currency, number> = {
      USD: 1,
      INR: 83.0,
      EUR: 0.92,
      GBP: 0.79,
      AUD: 1.52,
    };

    // Convert to USD first, then to target currency
    const inUSD = amount / rates[from];
    return inUSD * rates[to];
  }

  /**
   * Format currency with symbol
   */
  static formatCurrency(amount: number, currency: Currency): string {
    const symbols: Record<Currency, string> = {
      USD: '$',
      INR: '₹',
      EUR: '€',
      GBP: '£',
      AUD: 'A$',
    };

    return `${symbols[currency]}${amount.toFixed(2)}`;
  }

  /**
   * Get progress percentage for current billing cycle (0-100)
   */
  static getBillingCycleProgress(subscription: Subscription): number {
    const now = new Date();
    const nextBilling = this.getNextBillingDate(subscription);
    
    // Calculate previous billing date
    let prevBilling = new Date(nextBilling);
    prevBilling = this.subtractBillingCycle(prevBilling, subscription.frequency, subscription.customFrequencyDays);

    const totalTime = nextBilling.getTime() - prevBilling.getTime();
    const elapsed = now.getTime() - prevBilling.getTime();

    const progress = (elapsed / totalTime) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  private static subtractBillingCycle(date: Date, frequency: BillingFrequency, customDays?: number): Date {
    const newDate = new Date(date);

    switch (frequency) {
      case 'monthly':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() - 3);
        break;
      case 'half-yearly':
        newDate.setMonth(newDate.getMonth() - 6);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
      case 'custom':
        if (customDays) {
          newDate.setDate(newDate.getDate() - customDays);
        }
        break;
    }

    return newDate;
  }
}

