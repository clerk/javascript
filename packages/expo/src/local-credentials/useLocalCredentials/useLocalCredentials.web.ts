import { deprecated } from '@clerk/shared/deprecated';

import type { LocalCredentialsReturn } from './shared';
import { LocalCredentialsInitValues } from './shared';

export const useLocalCredentials = (): LocalCredentialsReturn => {
  deprecated(
    'useLocalCredentials',
    'Store the credentials with `expo-secure-store` and its `requireAuthentication` option instead, then sign in with the stored identifier and password. See https://docs.expo.dev/versions/latest/sdk/securestore/',
  );
  return LocalCredentialsInitValues;
};
