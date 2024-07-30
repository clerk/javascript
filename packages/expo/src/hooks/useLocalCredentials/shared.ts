import type { SignInResource } from '@clerk/types';

type LocalCredentials = {
  identifier?: string;
  password: string;
};

type BiometricType = 'fingerprint' | 'face-recognition';

type LocalCredentialsReturn = {
  setCredentials: (creds: LocalCredentials) => Promise<void>;
  hasCredentials: boolean;
  userOwnsCredentials: boolean | null;
  clearCredentials: () => Promise<void>;
  authenticate: () => Promise<SignInResource>;
  biometryType: BiometricType | null;
};

const LocalCredentialsInitValues: LocalCredentialsReturn = {
  setCredentials: () => Promise.resolve(),
  hasCredentials: false,
  userOwnsCredentials: null,
  clearCredentials: () => Promise.resolve(),
  // @ts-expect-error Initial value cannot return what the type expects
  authenticate: () => Promise.resolve({}),
  biometryType: null,
};

export { LocalCredentialsInitValues };

export type { LocalCredentials, BiometricType, LocalCredentialsReturn };
