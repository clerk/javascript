import type { SignInResource } from '@clerk/shared/types';

type LocalCredentials = {
  /**
   * The identifier of the credentials to be stored on the device. It can be a username, email, phone number, etc.
   */
  identifier?: string;
  /**
   * The password for the identifier to be stored on the device. If an identifier already exists on the device passing only password would update the password for the stored identifier.
   */
  password: string;
};

type BiometricType = 'fingerprint' | 'face-recognition';

type LocalCredentialsReturn = {
  setCredentials: (creds: LocalCredentials) => Promise<void>;
  hasCredentials: boolean;
  userOwnsCredentials: boolean | null;
  clearCredentials: () => Promise<void>;
  authenticate: () => Promise<SignInResource>;
  biometricType: BiometricType | null;
};

const LocalCredentialsInitValues: LocalCredentialsReturn = {
  setCredentials: () => Promise.resolve(),
  hasCredentials: false,
  userOwnsCredentials: null,
  clearCredentials: () => Promise.resolve(),
  // @ts-expect-error Initial value cannot return what the type expects
  authenticate: () => Promise.resolve({}),
  biometricType: null,
};

export { LocalCredentialsInitValues };

export type { LocalCredentials, BiometricType, LocalCredentialsReturn };
