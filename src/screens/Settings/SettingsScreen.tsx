import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, SafeScreen } from '@/core/components';
import type { SettingsScreenProps } from '@/navigation/types';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenProps['navigation']>();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
    return true;
  };

  return (
    <SafeScreen
      statusBarColor="#FFFFFF"
      barStyle="dark-content"
      onBackPress={handleBackPress}
      style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text size="xxl" style={styles.title}>Settings</Text>
        </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingText}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive push notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={notifications ? '#3B82F6' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Use dark theme</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={darkMode ? '#3B82F6' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingText}>Biometric Login</Text>
            <Text style={styles.settingDescription}>Use Face ID or fingerprint</Text>
          </View>
          <Switch
            value={biometrics}
            onValueChange={setBiometrics}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={biometrics ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.settingText}>Change Password</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.settingText}>Two-Factor Authentication</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.settingText}>Clear Cache</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.settingText}>Export Data</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.dangerItem]}>
          <Text style={styles.dangerText}>Delete Account</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default React.memo(SettingsScreen);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  title: {
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingText: {
    fontSize: 16,
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    fontSize: 16,
    color: '#EF4444',
  },
});
