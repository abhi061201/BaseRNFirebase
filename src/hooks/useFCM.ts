import { useState, useEffect } from 'react';
import { messagingService } from '@/service/firebase';
import logger from '@/utils/logger';
import { Tag } from '@/core/types/loggerTags';

interface UseFCMReturn {
  fcmToken: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Simple hook to get FCM token
 * Runs in background without blocking UI/navigation
 */
export const useFCM = (): UseFCMReturn => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Run FCM initialization in background after a small delay
    // This allows navigation to complete first
    const timer = setTimeout(() => {
      initializeFCM();
    }, 100); // Small delay to not block initial render

    return () => clearTimeout(timer);
  }, []);

  const initializeFCM = async () => {
    setIsLoading(true);
    
    try {
      logger.log(Tag.APP, '🔔 Requesting FCM permission and token (background)...');
      
      const response = await messagingService.getToken();

      if (response.success && response.token) {
        setFcmToken(response.token);
        console.log('✅ FCM Token generated:', response.token);
      } else {
        setError(response.error || 'Failed to get FCM token');
        console.error('❌ FCM Error:', response.error);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('❌ FCM initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fcmToken,
    isLoading,
    error,
  };
};

export default useFCM;

