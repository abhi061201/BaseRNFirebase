/**
 * SubsTrack - Type Definitions
 */

export type BillingFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'custom';

export type PaymentMethod = {
  id: string;
  name: string; // e.g., "HDFC Card", "Paytm UPI"
  type?: 'card' | 'upi' | 'netbanking' | 'other';
};

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AUD';

export interface Subscription {
  id: string;
  userId: string;
  
  // Basic Info
  serviceName: string;
  serviceIcon?: string; // URL or asset reference
  
  // Billing Details
  amount: number;
  currency: Currency;
  billingDate: number; // Day of month (1-31)
  frequency: BillingFrequency;
  customFrequencyDays?: number; // For custom frequency
  
  // Payment
  paymentMethod?: PaymentMethod;
  
  // Subscription Duration
  startDate: Date; // When subscription started
  isOneTime: boolean; // Is this a limited-time subscription?
  cycleLimit?: number; // End after X cycles (e.g., 6 months)
  
  // Reminders
  reminderEnabled: boolean;
  reminderDaysBefore: number; // Days before billing date
  
  // Metadata
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Sync metadata
  lastSyncedAt?: Date;
  isDeleted?: boolean; // Soft delete flag
}

export interface SubscriptionSummary {
  totalMonthlySpend: number;
  totalActiveSubscriptions: number;
  upcomingInNext7Days: Subscription[];
  upcomingThisMonth: Subscription[];
}

export interface AppSettings {
  userId: string;
  currency: Currency;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultReminderDays: number;
  updatedAt: Date;
}

// Pre-defined popular services
export const POPULAR_SERVICES = [
  { name: 'Netflix', icon: '🎬' },
  { name: 'Spotify', icon: '🎵' },
  { name: 'Apple Music', icon: '🎧' },
  { name: 'YouTube Premium', icon: '📺' },
  { name: 'Amazon Prime', icon: '📦' },
  { name: 'Disney+', icon: '🏰' },
  { name: 'iCloud', icon: '☁️' },
  { name: 'Google One', icon: '☁️' },
  { name: 'Adobe Creative Cloud', icon: '🎨' },
  { name: 'Microsoft 365', icon: '💼' },
  { name: 'GitHub', icon: '💻' },
  { name: 'ChatGPT Plus', icon: '🤖' },
  { name: 'Notion', icon: '📝' },
  { name: 'Canva Pro', icon: '🎨' },
  { name: 'Figma', icon: '🎨' },
] as const;

