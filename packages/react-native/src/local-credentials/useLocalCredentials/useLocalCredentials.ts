import { useClerk, useSignIn, useUser } from '@clerk/clerk-react';
import type { SignInResource } from '@clerk/types';
import { useEffect, useState } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import {
  ACCESS_CONTROL,
  ACCESSIBLE,
  getGenericPassword,
  hasGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';

import { errorThrower } from '../../utils';
import type { BiometricType, LocalCredentials, LocalCredentialsReturn } from './shared';

const useEnrolledBiometric = () => {
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    let ignore = false;
    const rnBiometrics = new ReactNativeBiometrics();
    void rnBiometrics.biometricKeysExist().then(({ keysExist }) => {
      if (ignore) {
        return;
      }
      setIsEnrolled(keysExist);
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
    const getBiometrics = async () => {
      const rnBiometrics = new ReactNativeBiometrics();
      const { biometryType } = await rnBiometrics.isSensorAvailable();
      if (biometryType === BiometryTypes.FaceID) {
        setAuthenticationType('face-recognition');
      } else if (biometryType === BiometryTypes.TouchID) {
        setAuthenticationType('fingerprint');
      }
    };
    void getBiometrics();
  }, []);

  return authenticationType;
};

const useUserOwnsCredentials = ({ storeKey }: { storeKey: string }) => {
  const { user } = useUser();
  const [userOwnsCredentials, setUserOwnsCredentials] = useState(false);

  useEffect(() => {
    let ignore = false;

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

    void getGenericPassword(storeKey)
      .catch(() => null)
      .then(res => {
        if (ignore || !res) {
          return;
        }
        setUserOwnsCredentials(getUserCredentials(res.password));
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
  const [hasLocalAuthCredentials, setHasLocalAuthCredentials] = useState(false);

  useEffect(() => {
    const checkHasCredentials = async () => {
      const hasCredentials = await hasGenericPassword(key);
      setHasLocalAuthCredentials(!!hasCredentials);
    };
    void checkHasCredentials();
  }, [key]);

  const [userOwnsCredentials, setUserOwnsCredentials] = useUserOwnsCredentials({ storeKey: key });
  const hasEnrolledBiometric = useEnrolledBiometric();
  const authenticationType = useAuthenticationType();

  const biometricType = hasEnrolledBiometric ? authenticationType : null;

  const setCredentials = async (creds: LocalCredentials) => {
    if (!hasEnrolledBiometric) {
      return;
    }

    if (creds.identifier && !creds.password) {
      return errorThrower.throw(
        `useLocalCredentials: setCredentials() A password is required when specifying an identifier.`,
      );
    }

    if (creds.identifier) {
      await setGenericPassword(key, creds.identifier);
    }

    const storedIdentifier = await hasGenericPassword(key).catch(() => null);

    if (!storedIdentifier) {
      return errorThrower.throw(
        `useLocalCredentials: setCredentials() an identifier should already be set in order to update its password.`,
      );
    }

    setHasLocalAuthCredentials(true);
    await setGenericPassword(pkey, creds.password, {
      accessible: ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    });
  };

  const clearCredentials = async () => {
    await Promise.all([resetGenericPassword(key), resetGenericPassword(pkey)]);
    setHasLocalAuthCredentials(false);
    setUserOwnsCredentials(false);
  };

  const authenticate = async (): Promise<SignInResource> => {
    if (!isLoaded) {
      return errorThrower.throw(
        `useLocalCredentials: authenticate() Clerk has not loaded yet. Wait for clerk to load before calling this function`,
      );
    }
    // note: identifier and password are of type UserCredentials.  So we use
    //       identifier.password and password.password to get the stored values
    const identifier = await getGenericPassword(key).catch(() => null);
    if (!identifier) {
      return errorThrower.throw(`useLocalCredentials: authenticate() the identifier could not be found`);
    }
    const password = await getGenericPassword(pkey).catch(() => null);
    if (!password) {
      return errorThrower.throw(
        `useLocalCredentials: authenticate() cannot retrieve a password for ${identifier.password}`,
      );
    }

    return signIn.create({
      strategy: 'password',
      identifier: identifier.password,
      password: password.password,
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
