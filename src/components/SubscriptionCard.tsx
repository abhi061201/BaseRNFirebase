/**
 * Subscription Card Component
 * 
 * Displays individual subscription with swipe actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Subscription } from '@/types/subscription.types';
import { SubscriptionCalculator } from '@/service/business';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: () => void;
  onDelete: () => void;
  onToggleReminder: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onPress,
  onDelete,
}) => {
  const nextBilling = SubscriptionCalculator.getNextBillingDate(subscription);
  const daysUntil = SubscriptionCalculator.getDaysUntilBilling(subscription);
  const progress = SubscriptionCalculator.getBillingCycleProgress(subscription);
  const formattedAmount = SubscriptionCalculator.formatCurrency(
    subscription.amount,
    subscription.currency
  );

  const getDaysText = () => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `in ${daysUntil} days`;
  };

  const getUrgencyColor = () => {
    if (daysUntil <= 3) return '#FF6B6B';
    if (daysUntil <= 7) return '#FFB84D';
    return '#4CAF50';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{subscription.serviceIcon || '💳'}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.serviceName}>{subscription.serviceName}</Text>
          <Text style={styles.frequency}>
            {subscription.frequency} • {subscription.paymentMethod?.name || 'No payment method'}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formattedAmount}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.daysText, { color: getUrgencyColor() }]}>
          {getDaysText()}
        </Text>
      </View>

      {/* Next Billing Date */}
      <Text style={styles.nextBilling}>
        Next: {nextBilling.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>

      {/* One-time indicator */}
      {subscription.isOneTime && subscription.cycleLimit && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {subscription.cycleLimit} months
          </Text>
        </View>
      )}

      {/* Delete button (for now - swipe actions can be added later) */}
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'capitalize',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
  nextBilling: {
    fontSize: 12,
    color: '#999999',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFB84D',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
  },
});

