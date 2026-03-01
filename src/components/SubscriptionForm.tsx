/**
 * Subscription Form Modal
 * 
 * Add/Edit subscription with all fields
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Subscription, BillingFrequency, Currency, POPULAR_SERVICES } from '@/types/subscription.types';
import { useSubscriptionStore, useSettingsStore } from '@/store';

interface SubscriptionFormProps {
  visible: boolean;
  onClose: () => void;
  subscription?: Subscription | null;
  userId: string;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  visible,
  onClose,
  subscription,
  userId,
}) => {
  const { addSubscription, updateSubscription } = useSubscriptionStore();
  const { currency, defaultReminderDays } = useSettingsStore();

  const isEditing = !!subscription;

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [serviceIcon, setServiceIcon] = useState('💳');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency || 'INR');
  const [billingDate, setBillingDate] = useState('1');
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly');
  const [customDays, setCustomDays] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isOneTime, setIsOneTime] = useState(false);
  const [cycleLimit, setCycleLimit] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(String(defaultReminderDays || 3));
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) {
      // Populate form for editing
      setServiceName(subscription.serviceName);
      setServiceIcon(subscription.serviceIcon || '💳');
      setAmount(String(subscription.amount));
      setSelectedCurrency(subscription.currency);
      setBillingDate(String(subscription.billingDate));
      setFrequency(subscription.frequency);
      setCustomDays(String(subscription.customFrequencyDays || ''));
      setPaymentMethod(subscription.paymentMethod?.name || '');
      setIsOneTime(subscription.isOneTime);
      setCycleLimit(String(subscription.cycleLimit || ''));
      setReminderEnabled(subscription.reminderEnabled);
      setReminderDays(String(subscription.reminderDaysBefore));
      setNotes(subscription.notes || '');
    } else {
      resetForm();
    }
  }, [subscription]);

  const resetForm = () => {
    setServiceName('');
    setServiceIcon('💳');
    setAmount('');
    setSelectedCurrency(currency || 'INR');
    setBillingDate('1');
    setFrequency('monthly');
    setCustomDays('');
    setPaymentMethod('');
    setIsOneTime(false);
    setCycleLimit('');
    setReminderEnabled(true);
    setReminderDays(String(defaultReminderDays || 3));
    setNotes('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Please enter a service name');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!billingDate || parseInt(billingDate) < 1 || parseInt(billingDate) > 31) {
      Alert.alert('Error', 'Please enter a valid billing date (1-31)');
      return;
    }
    if (frequency === 'custom' && (!customDays || parseInt(customDays) <= 0)) {
      Alert.alert('Error', 'Please enter valid custom frequency days');
      return;
    }
    if (isOneTime && (!cycleLimit || parseInt(cycleLimit) <= 0)) {
      Alert.alert('Error', 'Please enter valid cycle limit');
      return;
    }

    setIsSubmitting(true);

    try {
      const data: any = {
        userId,
        serviceName: serviceName.trim(),
        serviceIcon,
        amount: parseFloat(amount),
        currency: selectedCurrency,
        billingDate: parseInt(billingDate),
        frequency,
        customFrequencyDays: frequency === 'custom' ? parseInt(customDays) : undefined,
        paymentMethod: paymentMethod.trim()
          ? { id: Date.now().toString(), name: paymentMethod.trim() }
          : undefined,
        startDate: subscription?.startDate || new Date(),
        isOneTime,
        cycleLimit: isOneTime ? parseInt(cycleLimit) : undefined,
        reminderEnabled,
        reminderDaysBefore: parseInt(reminderDays),
        notes: notes.trim() || undefined,
      };

      if (isEditing && subscription) {
        await updateSubscription(subscription.id, data);
      } else {
        await addSubscription(data);
      }

      // Close modal immediately (user sees the subscription appear in the list)
      onClose();
      resetForm();
      
      // Optional: Uncomment below to show success alert after modal closes
      // setTimeout(() => {
      //   Alert.alert('Success', `Subscription ${isEditing ? 'updated' : 'added'} successfully!`);
      // }, 300);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSelect = (service: typeof POPULAR_SERVICES[number]) => {
    setServiceName(service.name);
    setServiceIcon(service.icon);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Popular Services */}
          {!isEditing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Services</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {POPULAR_SERVICES.map((service, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.serviceChip}
                    onPress={() => handleServiceSelect(service)}
                  >
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                    <Text style={styles.serviceName}>{service.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Service Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Service Name *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.iconInput}
                value={serviceIcon}
                onChangeText={setServiceIcon}
                maxLength={2}
              />
              <TextInput
                style={styles.textInput}
                value={serviceName}
                onChangeText={setServiceName}
                placeholder="e.g., Netflix"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Amount & Currency */}
          <View style={styles.section}>
            <Text style={styles.label}>Billing Amount *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { flex: 2 }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
              <View style={styles.picker}>
                <Text>{selectedCurrency}</Text>
              </View>
            </View>
          </View>

          {/* Billing Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Billing Date (Day of Month) *</Text>
            <TextInput
              style={styles.textInput}
              value={billingDate}
              onChangeText={setBillingDate}
              placeholder="1-31"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={styles.label}>Frequency *</Text>
            <View style={styles.frequencyContainer}>
              {(['monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'] as BillingFrequency[]).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyChip,
                    frequency === freq && styles.frequencyChipActive,
                  ]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === freq && styles.frequencyTextActive,
                    ]}
                  >
                    {freq.replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {frequency === 'custom' && (
              <TextInput
                style={[styles.textInput, { marginTop: 12 }]}
                value={customDays}
                onChangeText={setCustomDays}
                placeholder="Enter days"
                placeholderTextColor="#999"
                keyboardType="number-pad"
              />
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.label}>Payment Method</Text>
            <TextInput
              style={styles.textInput}
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="e.g., HDFC Card, Paytm UPI"
              placeholderTextColor="#999"
            />
          </View>

          {/* One-Time Subscription */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsOneTime(!isOneTime)}
            >
              <View style={[styles.checkbox, isOneTime && styles.checkboxActive]}>
                {isOneTime && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>One-Time Subscription (Limited Duration)</Text>
            </TouchableOpacity>
            {isOneTime && (
              <TextInput
                style={[styles.textInput, { marginTop: 12 }]}
                value={cycleLimit}
                onChangeText={setCycleLimit}
                placeholder="Number of cycles (e.g., 6 for 6 months)"
                placeholderTextColor="#999"
                keyboardType="number-pad"
              />
            )}
          </View>

          {/* Reminders */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setReminderEnabled(!reminderEnabled)}
            >
              <View style={[styles.checkbox, reminderEnabled && styles.checkboxActive]}>
                {reminderEnabled && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Enable Reminders</Text>
            </TouchableOpacity>
            {reminderEnabled && (
              <TextInput
                style={[styles.textInput, { marginTop: 12 }]}
                value={reminderDays}
                onChangeText={setReminderDays}
                placeholder="Days before billing"
                placeholderTextColor="#999"
                keyboardType="number-pad"
              />
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding:20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666666',
  },
  saveButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconInput: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  picker: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    justifyContent: 'center',
    minWidth: 80,
  },
  serviceChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  frequencyChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  frequencyText: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  frequencyTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1A1A1A',
  },
});

