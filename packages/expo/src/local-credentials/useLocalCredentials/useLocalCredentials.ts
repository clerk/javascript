import { useClerk, useUser } from '@clerk/react';
import { useSignIn } from '@clerk/react/legacy';
import type { SignInResource } from '@clerk/shared/types';
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
    void getItemAsync(storeKey)
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

/**
 * Exposes utilities that allow for storing and accessing an identifier, and it's password securely on the device.
 * In order to access the stored credentials, the end user will be prompted to verify themselves via biometrics.
 */
export const useLocalCredentials = (): LocalCredentialsReturn => {
  const { isLoaded, signIn } = useSignIn();
  const { publishableKey } = useClerk();

  const key = `__clerk_local_auth_${publishableKey}_identifier`;
  const pkey = `__clerk_local_auth_${publishableKey}_password`;
  const [hasLocalAuthCredentials, setHasLocalAuthCredentials] = useState(!!getItem(key));
  const [userOwnsCredentials, setUserOwnsCredentials] = useUserOwnsCredentials({ storeKey: key });
  const hasEnrolledBiometric = useEnrolledBiometric();
  const authenticationType = useAuthenticationType();

  const biometricType = hasEnrolledBiometric ? authenticationType : null;

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

  const authenticate = async (): Promise<SignInResource> => {
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
      return errorThrower.throw(`useLocalCredentials: authenticate() cannot retrieve a password for ${identifier}`);
    }

    return signIn.create({
      strategy: 'password',
      identifier,
      password,
    });
  };

  return {
    /**
     * Stores the provided credentials on the device if the device has enrolled biometrics.
     * The end user needs to have a passcode set in order for the credentials to be stored, and those credentials will be removed if the passcode gets removed.
     * @param credentials A [`LocalCredentials`](#localcredentials) object.
     * @return A promise that will reject if value cannot be stored on the device.
     */
    setCredentials,
    /**
     * A Boolean that indicates if there are any credentials stored on the device.
     */
    hasCredentials: hasLocalAuthCredentials,
    /**
     * A Boolean that indicates if the stored credentials belong to the signed in uer. When there is no signed-in user the value will always be `false`.
     */
    userOwnsCredentials,
    /**
     * Removes the stored credentials from the device.
     * @return A promise that will reject if value cannot be deleted from the device.
     */
    clearCredentials,
    /**
     * Attempts to read the stored credentials and creates a sign in attempt with the password strategy.
     * @return A promise with a SignInResource if the stored credentials were accessed, otherwise the promise will reject.
     */
    authenticate,
    /**
     * Indicates the supported enrolled biometric authenticator type.
     * Can be `facial-recognition`, `fingerprint` or null.
     */
    biometricType,
  };
};
