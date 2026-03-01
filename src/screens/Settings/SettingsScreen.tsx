/**
 * Settings Screen
 * 
 * App configuration and preferences
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSettingsStore } from '@/store';
import { Currency } from '@/types/subscription.types';

const MOCK_USER_ID = 'user_demo_123';

export const SettingsScreen: React.FC = () => {
  const {
    currency,
    notificationsEnabled,
    theme,
    defaultReminderDays,
    fetchSettings,
    setCurrency,
    setNotificationsEnabled,
    setTheme,
    setDefaultReminderDays,
  } = useSettingsStore();

  useEffect(() => {
    fetchSettings(MOCK_USER_ID);
  }, []);

  const handleCurrencyChange = () => {
    const currencies: Currency[] = ['USD', 'INR', 'EUR', 'GBP', 'AUD'];
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      currencies.map((curr) => ({
        text: curr,
        onPress: () => setCurrency(curr),
      }))
    );
  };

  const handleThemeChange = () => {
    const themes = ['light', 'dark', 'system'] as const;
    Alert.alert(
      'Select Theme',
      'Choose your app theme',
      themes.map((t) => ({
        text: t.charAt(0).toUpperCase() + t.slice(1),
        onPress: () => setTheme(t),
      }))
    );
  };

  const handleReminderDaysChange = () => {
    Alert.prompt(
      'Default Reminder Days',
      'How many days before billing should we remind you?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (value) => {
            const days = parseInt(value || '3');
            if (!isNaN(days) && days >= 0) {
              setDefaultReminderDays(days);
            }
          },
        },
      ],
      'plain-text',
      String(defaultReminderDays)
    );
  };

  const handleExportData = () => {
    // TODO: Implement CSV export
    Alert.alert('Export Data', 'CSV export will be available soon!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* General Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <TouchableOpacity style={styles.settingRow} onPress={handleCurrencyChange}>
          <View>
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingValue}>{currency || 'USD'}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleThemeChange}>
          <View>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>
              {theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : 'System'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive alerts for upcoming payments
            </Text>
          </View>
          <Switch
            value={notificationsEnabled ?? true}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleReminderDaysChange}
        >
          <View>
            <Text style={styles.settingLabel}>Default Reminder</Text>
            <Text style={styles.settingValue}>
              {defaultReminderDays || 3} days before billing
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
          <View>
            <Text style={styles.settingLabel}>Export Data</Text>
            <Text style={styles.settingDescription}>Download your data as CSV</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Made with</Text>
          <Text style={styles.settingValue}>❤️ for Gen-Z/Millennials</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    marginLeft: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
  },
  settingDescription: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#CCCCCC',
  },
});
