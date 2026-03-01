/**
 * Backend Service - Central Export
 * 
 * LocalStorage only - Zustand + AsyncStorage
 */

export type { IBackendService } from './IBackendService';
export { LocalStorageBackendService } from './LocalStorageBackendService';
export { getBackendService, backendService } from './BackendFactory';

