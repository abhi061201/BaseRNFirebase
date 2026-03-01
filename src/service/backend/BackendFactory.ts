/**
 * Backend Factory
 * 
 * LocalStorage only - pure Zustand + AsyncStorage
 */

import { IBackendService } from './IBackendService';
import { localStorageBackendService } from './LocalStorageBackendService';
import { logger } from '@/utils/logger';

class BackendFactory {
  private static instance: IBackendService = localStorageBackendService;

  /**
   * Get backend service (LocalStorage only)
   */
  static async getBackendService(): Promise<IBackendService> {
    logger.info('BackendFactory', 'Using LocalStorage backend');
    return this.instance;
  }

  /**
   * Synchronous getter
   */
  static getBackendServiceSync(): IBackendService {
    return this.instance;
  }
}

export const getBackendService = () => BackendFactory.getBackendService();

export const backendService = BackendFactory.getBackendServiceSync();

export default getBackendService;

