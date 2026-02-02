import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL as firebaseGetDownloadURL,
  deleteObject,
  list,
  listAll,
  FirebaseStorageTypes,
} from '@react-native-firebase/storage';
import { firebaseConfig } from './config';

export type StorageReference = FirebaseStorageTypes.Reference;
export type UploadTask = FirebaseStorageTypes.Task;

interface StorageError extends Error {
  code: string;
}

interface StorageResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

/**
 * Firebase Cloud Storage Service
 * Singleton pattern for file storage operations (Modular API)
 */
class StorageService {
  private static instance: StorageService;
  private storage: FirebaseStorageTypes.Module;

  private constructor() {
    if (!firebaseConfig.isInitialized) {
      console.warn('Firebase not initialized. Storage service may not work properly.');
    }
    this.storage = getStorage();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Get reference to a storage path
   */
  public ref(path: string): StorageReference {
    return ref(this.storage, path);
  }

  /**
   * Upload a file from local path
   */
  public async uploadFile(
    storagePath: string,
    localFilePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<StorageResponse> {
    try {
      const reference = ref(this.storage, storagePath);
      const task = reference.putFile(localFilePath);

      if (onProgress) {
        task.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress,
          });
        });
      }

      await task;
      const url = await firebaseGetDownloadURL(reference);

      return {
        success: true,
        url,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as StorageError),
      };
    }
  }

  /**
   * Upload data as bytes/string
   */
  public async uploadData(
    storagePath: string,
    data: string,
    format: 'base64' | 'base64url' | 'data_url' = 'base64'
  ): Promise<StorageResponse> {
    try {
      const reference = ref(this.storage, storagePath);
      await reference.putString(data, format);
      const url = await firebaseGetDownloadURL(reference);

      return {
        success: true,
        url,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as StorageError),
      };
    }
  }

  /**
   * Get download URL for a file
   */
  public async getDownloadURL(storagePath: string): Promise<StorageResponse> {
    try {
      const reference = ref(this.storage, storagePath);
      const url = await firebaseGetDownloadURL(reference);

      return {
        success: true,
        url,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as StorageError),
      };
    }
  }

  /**
   * Delete a file
   */
  public async deleteFile(storagePath: string): Promise<StorageResponse> {
    try {
      const reference = ref(this.storage, storagePath);
      await deleteObject(reference);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as StorageError),
      };
    }
  }

  /**
   * List files in a directory
   */
  public async listFiles(
    storagePath: string,
    maxResults?: number
  ): Promise<{ success: boolean; items?: string[]; error?: string }> {
    try {
      const reference = ref(this.storage, storagePath);
      const result = maxResults
        ? await list(reference, { maxResults })
        : await listAll(reference);

      const items = result.items.map((item) => item.fullPath);

      return {
        success: true,
        items,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error as StorageError),
      };
    }
  }

  /**
   * Convert Firebase Storage errors to user-friendly messages
   */
  private getErrorMessage(error: StorageError): string {
    switch (error.code) {
      case 'storage/unauthorized':
        return 'You do not have permission to access this file.';
      case 'storage/canceled':
        return 'Upload was cancelled.';
      case 'storage/unknown':
        return 'An unknown error occurred.';
      case 'storage/object-not-found':
        return 'File not found.';
      case 'storage/quota-exceeded':
        return 'Storage quota exceeded.';
      case 'storage/retry-limit-exceeded':
        return 'Maximum retry time exceeded. Please try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
export default storageService;
