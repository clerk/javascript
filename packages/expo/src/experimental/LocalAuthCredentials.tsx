import { useClerk, useSignIn } from '@clerk/clerk-react';
import type { SignInResource } from '@clerk/types';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState } from 'react';

type LocalAuthCredentials = {
  identifier: string;
  password: string;
};

export const LocalAuthContext = createContext<{
  setLocalAuthCredentials: (creds: LocalAuthCredentials) => Promise<void>;
  hasLocalAuthCredentials: boolean;
  clearLocalAuthAccount: () => void;
  authenticateWithLocalAccount: () => Promise<SignInResource>;
}>({
  // @ts-expect-error Initial value cannot return what the type expects
  setLocalAuthCredentials: () => {},
  hasLocalAuthCredentials: false,
  clearLocalAuthAccount: () => {},
  // @ts-expect-error Initial value cannot return what the type expects
  authenticateWithLocalAccount: () => {},
});

export const useLocalAuthCredentials = () => {
  return useContext(LocalAuthContext);
};

export function LocalAuthCredentialsProvider(props: PropsWithChildren): JSX.Element {
  const { isLoaded, signIn } = useSignIn();
  const { publishableKey } = useClerk();
  const key = `__clerk_local_auth_${publishableKey}_identifier`;
  const pkey = `__clerk_local_auth_${publishableKey}_password`;
  const [hasLocalAuthCredentials, setHasLocalAuthCredentials] = useState(!!SecureStore.getItem(key));

  const setLocalAuthCredentials = async (creds: LocalAuthCredentials) => {
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

  const clearLocalAuthAccount = async () => {
    await Promise.all([SecureStore.deleteItemAsync(key), SecureStore.deleteItemAsync(pkey)]);
    setHasLocalAuthCredentials(false);
  };

  const authenticateWithLocalAccount = async () => {
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
        setLocalAuthCredentials,
        hasLocalAuthCredentials,
        clearLocalAuthAccount,
        authenticateWithLocalAccount,
      }}
    >
      {props.children}
    </LocalAuthContext.Provider>
  );
}
