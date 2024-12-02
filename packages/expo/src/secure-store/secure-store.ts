import * as SecureStore from 'expo-secure-store';

import type { IStorage } from '../provider/singleton/types';

export const createSecureStore = (): IStorage => {
  const set = async (key: string, value: string): Promise<void> => {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.log(`Clerk: Error setting value on ${key} in SecureStore:`, error);
    }
  };

  const get = async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.log(`Clerk: Error getting value from ${key} in SecureStore:`, error);
      return null;
    }
  };

  return {
    set,
    get,
  };
};
