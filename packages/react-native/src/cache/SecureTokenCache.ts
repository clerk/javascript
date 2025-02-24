import { getGenericPassword, resetGenericPassword, setGenericPassword } from 'react-native-keychain';

import type { TokenCache } from './types';

const createSecureTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await getGenericPassword(key);
        if (item) {
          console.log(`${key} was used 🔐 \n`);
          return item.password;
        } else {
          console.log('No values stored under key: ' + key);
        }
        return null;
      } catch (error) {
        console.error('keychain get item error: ', error);
        await resetGenericPassword(key);
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      await setGenericPassword(key, token);
      return Promise.resolve();
    },
    clearToken: async (key: string) => {
      await resetGenericPassword(key);
      return Promise.resolve();
    },
  };
};

export const SecureTokenCache = createSecureTokenCache();
