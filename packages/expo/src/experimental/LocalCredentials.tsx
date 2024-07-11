import { useClerk, useSignIn, useUser } from '@clerk/clerk-react';
import type { SignInResource } from '@clerk/types';
import { AuthenticationType, isEnrolledAsync, supportedAuthenticationTypesAsync } from 'expo-local-authentication';
import {
  canUseBiometricAuthentication,
  deleteItemAsync,
  getItem,
  getItemAsync,
  setItemAsync,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
} from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type LocalCredentials = {
  identifier?: string;
  password: string;
};

type BiometricType = 'fingerprint' | 'face-recognition';

export const LocalAuthContext = createContext<{
  setCredentials: (creds: LocalCredentials) => Promise<void>;
  hasCredentials: boolean;
  userOwnsCredentials: boolean | null;
  clearCredentials: () => void;
  authenticate: () => Promise<SignInResource>;
  biometryType: BiometricType | null;
}>({
  // @ts-expect-error Initial value cannot return what the type expects
  setCredentials: () => {},
  hasCredentials: false,
  userOwnsCredentials: null,
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

const useUserOwnsCredentials = ({ storeKey }: { storeKey: string }) => {
  const { user } = useUser();
  const [userOwnsCredentials, setUserOwnsCredentials] = useState(false);

  const getUserCredentials = (storedIdentifier: string | null): boolean => {
    if (!user || !storedIdentifier) {
      return false;
    }

    const identifiers = [
      user.emailAddresses.map(e => e.emailAddress),
      user.phoneNumbers.map(p => p.phoneNumber),
    ].flat();

    if (user.username) {
      identifiers.push(user.username);
    }
    return identifiers.includes(storedIdentifier);
  };

  useEffect(() => {
    let ignore = false;
    getItemAsync(storeKey)
      .catch(() => null)
      .then(res => {
        if (ignore) {
          return;
        }
        setUserOwnsCredentials(getUserCredentials(res));
      });

    return () => {
      ignore = true;
    };
  }, [storeKey, user]);

  return [userOwnsCredentials, setUserOwnsCredentials] as const;
};

export function LocalCredentialsProvider(props: PropsWithChildren): JSX.Element {
  const { isLoaded, signIn } = useSignIn();
  const { publishableKey } = useClerk();

  const key = `__clerk_local_auth_${publishableKey}_identifier`;
  const pkey = `__clerk_local_auth_${publishableKey}_password`;
  const [hasLocalAuthCredentials, setHasLocalAuthCredentials] = useState(!!getItem(key));
  const [userOwnsCredentials, setUserOwnsCredentials] = useUserOwnsCredentials({ storeKey: key });
  const hasEnrolledBiometric = useEnrolledBiometric();
  const authenticationType = useAuthenticationType();

  const biometryType = hasEnrolledBiometric ? authenticationType : null;

  const setCredentials = async (creds: LocalCredentials) => {
    if (!canUseBiometricAuthentication()) {
      return;
    }

    if (creds.identifier && !creds.password) {
      throw 'when setting identifier the password is required';
    }

    if (creds.identifier) {
      await setItemAsync(key, creds.identifier);
    }

    const storedIdentifier = await getItemAsync(key).catch(() => null);

    if (!storedIdentifier) {
      throw 'an identifier should already be set in order to update its password';
    }

    setHasLocalAuthCredentials(true);
    await setItemAsync(pkey, creds.password, {
      keychainAccessible: WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      requireAuthentication: true,
    });
  };

  const clearCredentials = async () => {
    await Promise.all([deleteItemAsync(key), deleteItemAsync(pkey)]);
    setHasLocalAuthCredentials(false);
    setUserOwnsCredentials(false);
  };

  const authenticate = async () => {
    if (!isLoaded) {
      // TODO: improve error
      throw 'not loaded';
    }
    const identifier = await getItemAsync(key).catch(() => null);
    if (!identifier) {
      // TODO: improve error
      throw 'Identifier not found';
    }
    const password = await getItemAsync(pkey).catch(() => null);

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
        userOwnsCredentials,
        clearCredentials,
        authenticate,
        biometryType,
      }}
    >
      {props.children}
    </LocalAuthContext.Provider>
  );
}
