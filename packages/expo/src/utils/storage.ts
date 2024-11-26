import AsyncStorage from '@react-native-async-storage/async-storage';

import { errorThrower } from '../errorThrower';

const CLERK_ENVIRONMENT_KEY = '__clerk_environment_';
const CLERK_CLIENT_KEY = '__clerk_client_';

export const createAsyncStorage = (publishableKey: string) => {
  if (!publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
  }

  // get 5 last characters of publishableKey
  const hash = publishableKey.slice(-5);

  const setEnvironment = async (environmentJSON: any) => {
    return AsyncStorage.setItem(CLERK_ENVIRONMENT_KEY + hash, JSON.stringify(environmentJSON));
  };

  const getEnvironment = async (): Promise<any> => {
    const env = await AsyncStorage.getItem(CLERK_ENVIRONMENT_KEY + hash);
    return env ? JSON.parse(env) : null;
  };

  const setClient = async (clientJSON: any) => {
    return AsyncStorage.setItem(CLERK_CLIENT_KEY + hash, JSON.stringify(clientJSON));
  };

  const getClient = async (): Promise<any> => {
    const client = await AsyncStorage.getItem(CLERK_CLIENT_KEY + hash);
    return client ? JSON.parse(client) : null;
  };

  return {
    setEnvironment,
    getEnvironment,
    setClient,
    getClient,
  };
};
