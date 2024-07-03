import { useClerk, useSignIn } from '@clerk/clerk-react';
import type { SignInResource } from '@clerk/types';
import { AuthenticationType, isEnrolledAsync, supportedAuthenticationTypesAsync } from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type LocalCredentials = {
  identifier: string;
  password: string;
};

type BiometricType = 'fingerprint' | 'face-recognition';

export const LocalAuthContext = createContext<{
  setCredentials: (creds: LocalCredentials) => Promise<void>;
  hasCredentials: boolean;
  clearCredentials: () => void;
  authenticate: () => Promise<SignInResource>;
  biometryType: BiometricType | null;
}>({
  // @ts-expect-error Initial value cannot return what the type expects
  setCredentials: () => {},
  hasCredentials: false,
  clearCredentials: () => {},
  // @ts-expect-error Initial value cannot return what the type expects
  authenticate: () => {},
  biometryType: null,
});

export const useLocalCredentials = () => {
  return useContext(LocalAuthContext);
};

const useEnrolledBiometric = () => {
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    let ignore = false;

    void isEnrolledAsync().then(res => {
      if (ignore) {
        return;
      }
      setIsEnrolled(res);
    });

    return () => {
      ignore = true;
    };
  }, []);

  return isEnrolled;
};

const useAuthenticationType = () => {
  const [authenticationType, setAuthenticationType] = useState<BiometricType | null>(null);

  useEffect(() => {
    let ignore = false;

    void supportedAuthenticationTypesAsync().then(numericTypes => {
      if (ignore) {
        return;
      }
      if (numericTypes.length === 0) {
        return;
      }

      if (numericTypes.includes(AuthenticationType.FINGERPRINT)) {
        setAuthenticationType('fingerprint');
      } else {
        setAuthenticationType('face-recognition');
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  return authenticationType;
};

export function LocalCredentialsProvider(props: PropsWithChildren): JSX.Element {
  const { isLoaded, signIn } = useSignIn();
  const { publishableKey } = useClerk();
  const key = `__clerk_local_auth_${publishableKey}_identifier`;
  const pkey = `__clerk_local_auth_${publishableKey}_password`;
  const [hasLocalAuthCredentials, setHasLocalAuthCredentials] = useState(!!SecureStore.getItem(key));
  const hasEnrolledBiometric = useEnrolledBiometric();
  const authenticationType = useAuthenticationType();

  const biometryType = hasEnrolledBiometric ? authenticationType : null;

  const setCredentials = async (creds: LocalCredentials) => {
    if (!SecureStore.canUseBiometricAuthentication()) {
      return;
    }
    await SecureStore.setItemAsync(key, creds.identifier);
    setHasLocalAuthCredentials(true);
    await SecureStore.setItemAsync(pkey, creds.password, {
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      requireAuthentication: true,
    });
  };

  const clearCredentials = async () => {
    await Promise.all([SecureStore.deleteItemAsync(key), SecureStore.deleteItemAsync(pkey)]);
    setHasLocalAuthCredentials(false);
  };

  const authenticate = async () => {
    if (!isLoaded) {
      // TODO: improve error
      throw 'not loaded';
    }
    const identifier = await SecureStore.getItemAsync(key).catch(() => null);
    if (!identifier) {
      // TODO: improve error
      throw 'Identifier not found';
    }
    const password = await SecureStore.getItemAsync(pkey).catch(() => null);

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
        biometryType,
      }}
    >
      {props.children}
    </LocalAuthContext.Provider>
  );
}
