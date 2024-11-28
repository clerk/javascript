import type { ClientJSON, EnvironmentJSON } from '@clerk/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IAsyncStorage } from 'src/provider/singleton/types';

import { errorThrower } from '../errorThrower';

const CLERK_ENVIRONMENT_KEY = '__clerk_environment_';
const CLERK_CLIENT_KEY = '__clerk_client_';

export const createAsyncStorage = (publishableKey: string): IAsyncStorage => {
  if (!publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
  }

  // get 5 last characters of publishableKey
  const hash = publishableKey.slice(-5);

  const setEnvironment = async (environmentJSON: EnvironmentJSON): Promise<void> => {
    try {
      return AsyncStorage.setItem(CLERK_ENVIRONMENT_KEY + hash, JSON.stringify(environmentJSON));
    } catch (error) {
      console.log('Clerk: Error setting EnvironmentResource in AsyncStorage:', error);
    }
  };

  const getEnvironment = async (): Promise<EnvironmentJSON | null> => {
    try {
      const environment = await AsyncStorage.getItem(CLERK_ENVIRONMENT_KEY + hash);
      return environment ? JSON.parse(environment) : null;
    } catch (error) {
      console.log('Clerk: Error getting EnvironmentResource from AsyncStorage:', error);
      return null;
    }
  };

  const setClient = async (clientJSON: ClientJSON): Promise<void> => {
    try {
      return AsyncStorage.setItem(CLERK_CLIENT_KEY + hash, JSON.stringify(clientJSON));
    } catch (error) {
      console.log('Clerk: Error setting ClientResource in AsyncStorage:', error);
    }
  };

  const getClient = async (): Promise<ClientJSON | null> => {
    try {
      const client = await AsyncStorage.getItem(CLERK_CLIENT_KEY + hash);
      return client ? JSON.parse(client) : null;
    } catch (error) {
      console.log('Clerk: Error getting ClientResource from AsyncStorage:', error);
      return null;
    }
  };

  return {
    setEnvironment,
    getEnvironment,
    setClient,
    getClient,
  };
};
