import { useClerk, useSignIn } from '@clerk/clerk-react';
import type { SignInResource } from '@clerk/types';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState } from 'react';

type LocalCredentials = {
  identifier: string;
  password: string;
};

export const LocalAuthContext = createContext<{
  setCredentials: (creds: LocalCredentials) => Promise<void>;
  hasCredentials: boolean;
  clearCredentials: () => void;
  authenticate: () => Promise<SignInResource>;
}>({
  // @ts-expect-error Initial value cannot return what the type expects
  setCredentials: () => {},
  hasCredentials: false,
  clearCredentials: () => {},
  // @ts-expect-error Initial value cannot return what the type expects
  authenticate: () => {},
});

export const useLocalCredentials = () => {
  return useContext(LocalAuthContext);
};

export function LocalCredentialsProvider(props: PropsWithChildren): JSX.Element {
  const { isLoaded, signIn } = useSignIn();
  const { publishableKey } = useClerk();
  const key = `__clerk_local_auth_${publishableKey}_identifier`;
  const pkey = `__clerk_local_auth_${publishableKey}_password`;
  const [hasLocalAuthCredentials, setHasLocalAuthCredentials] = useState(!!SecureStore.getItem(key));

  const setCredentials = async (creds: LocalCredentials) => {
    if (!SecureStore.canUseBiometricAuthentication()) {
      return;
    }
    await SecureStore.setItemAsync(key, creds.identifier);
    await SecureStore.setItemAsync(pkey, creds.password, {
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      requireAuthentication: true,
    });
    setHasLocalAuthCredentials(true);
  };

  const clearCredentials = async () => {
    await Promise.all([SecureStore.deleteItemAsync(key), SecureStore.deleteItemAsync(pkey)]);
    setHasLocalAuthCredentials(false);
  };

  const authenticate = async () => {
    if (!isLoaded) {
      throw 'not loaded';
    }
    const identifier = await SecureStore.getItemAsync(key);
    if (!identifier) {
      // TODO: improve error
      throw 'Identifier not found';
    }
    const password = await SecureStore.getItemAsync(pkey);

    if (!password) {
      // TODO: improve error
      throw 'password not found';
    }

    return signIn.create({
      strategy: 'password',
      identifier,
      password,
    });
  };

  return (
    <LocalAuthContext.Provider
      value={{
        setCredentials,
        hasCredentials: hasLocalAuthCredentials,
        clearCredentials,
        authenticate,
      }}
    >
      {props.children}
    </LocalAuthContext.Provider>
  );
}
