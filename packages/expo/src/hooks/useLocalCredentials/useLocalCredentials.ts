import { useClerk, useSignIn, useUser } from '@clerk/clerk-react';
import { AuthenticationType, isEnrolledAsync, supportedAuthenticationTypesAsync } from 'expo-local-authentication';
import {
  deleteItemAsync,
  getItem,
  getItemAsync,
  setItemAsync,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
} from 'expo-secure-store';
import { useEffect, useState } from 'react';

import { errorThrower } from '../../utils';
import type { BiometricType, LocalCredentials, LocalCredentialsReturn } from './shared';

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

      if (
        numericTypes.includes(AuthenticationType.IRIS) ||
        numericTypes.includes(AuthenticationType.FACIAL_RECOGNITION)
      ) {
        setAuthenticationType('face-recognition');
      } else {
        setAuthenticationType('fingerprint');
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

export const useLocalCredentials = (): LocalCredentialsReturn => {
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
    if (!(await isEnrolledAsync())) {
      return;
    }

    if (creds.identifier && !creds.password) {
      return errorThrower.throw(
        `useLocalCredentials: setCredentials() A password is required when specifying an identifier.`,
      );
    }

    if (creds.identifier) {
      await setItemAsync(key, creds.identifier);
    }

    const storedIdentifier = await getItemAsync(key).catch(() => null);

    if (!storedIdentifier) {
      return errorThrower.throw(
        `useLocalCredentials: setCredentials() an identifier should already be set in order to update its password.`,
      );
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
      return errorThrower.throw(
        `useLocalCredentials: authenticate() Clerk has not loaded yet. Wait for clerk to load before calling this function`,
      );
    }
    const identifier = await getItemAsync(key).catch(() => null);
    if (!identifier) {
      return errorThrower.throw(`useLocalCredentials: authenticate() the identifier could not be found`);
    }
    const password = await getItemAsync(pkey).catch(() => null);

    if (!password) {
      return errorThrower.throw(`useLocalCredentials: authenticate() cannot retrieve a password for that identifier`);
    }

    return signIn.create({
      strategy: 'password',
      identifier,
      password,
    });
  };
  return {
    setCredentials,
    hasCredentials: hasLocalAuthCredentials,
    userOwnsCredentials,
    clearCredentials,
    authenticate,
    biometryType,
  };
};
