/**
 * Dashboard Screen (Main Screen)
 * 
 * Shows summary and subscription list
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSubscriptionStore } from '@/store';
import { SubscriptionCard, SubscriptionForm } from '@/components';
import { Subscription } from '@/types/subscription.types';
import { SubscriptionCalculator } from '@/service/business';
import { useAppLifecycle } from '@/hooks';
import SafeScreen from '@/core/SafeScreen';

// Mock user ID - replace with actual auth later
const MOCK_USER_ID = 'user_demo_123';

export const DashboardScreen: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const {
    subscriptions,
    summary,
    isLoading,
    fetchSubscriptions,
    deleteSubscription,
    calculateSummary,
  } = useSubscriptionStore();

  // Handle app lifecycle (sync & notifications)
  // useAppLifecycle();

  useEffect(() => {
    // Calculate summary on mount to ensure it's always up to date
    // This ensures total monthly spend is recalculated when app restarts
    calculateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    await fetchSubscriptions(MOCK_USER_ID);
    calculateSummary();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    // In production, show confirmation dialog
    Alert.alert('Delete Subscription', 'Are you sure you want to delete this subscription?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteSubscription(id) },
    ]);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowAddModal(true);
  };

  const activeSubscriptions = subscriptions
    .filter((sub) => SubscriptionCalculator.isActive(sub))
    .sort((a, b) => 
      SubscriptionCalculator.getDaysUntilBilling(a) - 
      SubscriptionCalculator.getDaysUntilBilling(b)
    );

  if (isLoading && subscriptions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <FlatList
        data={activeSubscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Tracker</Text>
              {/* <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => {
                  // TODO: Navigate to Settings screen
                  Alert.alert('Settings', 'Settings screen navigation coming soon!');
                }}
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity> */}
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Monthly Spend</Text>
              <Text style={styles.summaryAmount}>
                {summary
                  ? SubscriptionCalculator.formatCurrency(summary.totalMonthlySpend, 'INR')
                  : '₹0.00'}
              </Text>
              <View style={styles.summaryStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {summary?.totalActiveSubscriptions || 0}
                  </Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {summary?.upcomingInNext7Days.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Next 7 Days</Text>
                </View>
              </View>
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Subscriptions</Text>
              <Text style={styles.sectionSubtitle}>
                Sorted by next billing date
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            onPress={() => handleEditSubscription(item)}
            onDelete={() => handleDelete(item.id)}
            onToggleReminder={() => {/* TODO */}}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No subscriptions yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first subscription
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#4CAF50"
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* FAB - Add Subscription */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedSubscription(null);
          setShowAddModal(true);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Subscription Modal */}
      <SubscriptionForm
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        userId={MOCK_USER_ID}
      />
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal:20,
    paddingBottom:10
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  summaryCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

